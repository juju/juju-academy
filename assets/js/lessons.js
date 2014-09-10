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
  var task_line = $('<a class="item"><i class="green circle ok icon"></i><div class="content header"><div class="sub"></div></div></a>');
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
      .html(v.hint);
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
