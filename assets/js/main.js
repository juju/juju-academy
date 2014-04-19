var greet = "Welcome to Juju Academy (juju-academy 0.0.1 web)\n\n\
\
 * Documentation:  https://help.juju.academy\n\n\
\
Last login: " + new Date().toString();

window.commands = new Commands();
window.file = new Files();
window.lessons = {};
window.lesson = null;

function load_commands(cmds) {
  $.each(cmds, function(i, cmd) {
    window.commands.add(cmd);
  });
}

function ready_set_next() {
  ready = true;
  $('.sidebar .tasks .item').each(function() {
    if(!$(this).children('i.icon').hasClass('green')) {
      ready = false;
    }
  });

  $('.sidebar .tasks .item').promise().done(function() {
    if(ready) {
      $('.sidebar .button.next')
        .removeClass('disabled')
        .data('lesson', next_lesson(window.lesson))
        .click(function() {
          if(!$(this).hasClass('disabled')) {
            window.terminal.clear();
            $('.sidebar .lesson.description').show();
            $('.sidebar h1 i').removeClass('green');
            $.address.value($(this).data('lesson'));
          }
        });
    } else {
      $('.sidebar .button.next')
        .addClass('disabled')
        .data('lesson', '');
    }
  });
}

function next_lesson(l) {
  var keys = Object.keys(window.lessons).sort();
  var loc = keys.indexOf(l);
  var next = keys[loc+1];

  if(next) {
    return next;
  }
}

function previous_lesson(l) {
  var keys = Object.keys(window.lessons).sort();
  var loc = keys.indexOf(l);
  var next = keys[loc-1];

  if(next) {
    return next;
  }
}

function load_lesson(l) {
  $('.sidebar h1 .content').text(l.name);
  if(l.description instanceof Array) {
    l.description = l.description.join('</p><p>');
  }

  $('.sidebar .lesson.description').html('<p>' + l.description + '</p>');
  var task_line = $('<a class="item"><i class="green circle ok icon"></i><div class="content"><div class="sub"></div></div></a>');
  $('.sidebar .tasks.list').empty();

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
        ready_set_next();
        next();
      });
    };
    window.commands.add(runner, true);
    ready_set_next();
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
  $('.ui.dropdown').dropdown();
  $('.sidebar h1').click(function(e) {
    $('.sidebar .lesson.description').slideToggle();
    $('.sidebar h1 i').toggleClass('green');
  });

  $('#term').terminal(function(cmd, term) {
    window.terminal = term;
    window.commands.run(cmd, term);
  }, {
    prompt: 'demo@ubuntu:~$ ',
    greetings: greet,
    completion: true
  });

  $.getScript("commands/builtins.jsonp");
  $.getScript("commands/juju.jsonp");
  $.getJSON('lessons.json', function(data) {
    data.lessons.forEach(function(l) {
      // TODO: make this less ugly
      var lesson = l.split('/')[1].split('.')[0];
      window.lessons[lesson] = l;
    });
  });

  $.address.change(function(e) {
    var lesson = e.value;
    if(lesson == '/' || !$.inArray(window.lessons, lesson.replace('/', ''))) {
      $.address.value('00-what-is-juju');
      lesson = "00-what-is-juju";
    }
    $.getScript("lessons/" + lesson + ".jsonp");
    window.lesson = lesson.replace('/', '');
  });
});
