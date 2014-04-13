var greet = "Welcome to Juju Academy (juju-academy 0.0.1 web)\n\n\
\
 * Documentation:  https://help.juju.academy\n\n\
\
Last login: " + new Date().toString();

window.commands = new Commands();
window.file = new Files();

function load_commands(cmds) {
  $.each(cmds, function(i, cmd) {
    window.commands.add(cmd);
  });
}

function load_lesson(l) {
  $('.sidebar h1 .content').text(l.name);
  if(l.description instanceof Array) {
    l.description = l.description.join('</p><p>');
  }

  $('.sidebar .lesson.description').html('<p>' + l.description + '</p>');
  var task_line = $('.sidebar .tasks.list a').detach();

  // TODO: Holy fucking shit refactor this
  $.each(l.tasks, function(k, v) {
    var t = task_line.clone(),
        r;

    t.children('i.icon')
      .removeClass('green')
      .removeClass('ok')
      .addClass('blank');
    t.children('.content')
      .prepend(v.name)
      .children('.sub')
      .html(v.hint)
      .hide();
    t.attr('id', k);

    $('.sidebar .tasks.list').append(t);

    if($.isFunction(v.validate)) {
      // Someone has a complex function, which is cool, we just need to wrap it
      // to manage state of task
      r = v.validate;
    } else {
      var match = v.validate.match;
      if(typeof v.validate === "string") {
        match = v.validate;
      }

      r = function(cmd, term, next) {
        if(!cmd.match(match)) {
          return next(true);
        }

        if(v.validate.echo) {
          term.echo(v.validate.echo);
        }
        next();
      };
    }

    var runner = function(cmd, term, next) {
      r(cmd, term, function(err) {
        if(!err) {
          $('#' + k + ' i.icon')
            .addClass('green')
            .addClass('ok')
            .removeClass('blank');
          $('#' + k + ' .content')
            .removeClass('header')
            .children('.sub')
              .slideUp();
        }
        next();
      });
    };
    window.commands.add(runner, true);
  });

  $('.tasks.list a.item').click(function() {
    $(this)
      .children('.content')
      .toggleClass('header')
      .children('.sub')
      .slideToggle();
  });
}

$(document).ready(function() {
  //$('.filter.menu .item').tab();

  $('.ui.rating').rating({
    clearable: true
  });

  // $('.ui.sidebar').sidebar('attach events', '.launch.button');

  $('.ui.dropdown').dropdown();

  $('.sidebar h1').click(function(e) {
    $('.sidebar .lesson.description').slideToggle();
    $('.sidebar h1 i').toggleClass('green');
  });

  $('#term').terminal(function(cmd, term) {
    window.commands.run(cmd, term);
  }, {
    prompt: 'demo@ubuntu:~$ ',
    greetings: greet,
    completion: true
  });

  $.getScript("commands/juju.jsonp");
  $.getScript("lessons/01-set-up-juju.jsonp");
});
