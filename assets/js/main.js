var greet = "Welcome to Juju Academy ({0} {1} web)\n\n\
\
 * Documentation:  https://help.juju.academy\n\
 * Juju Documentation: https://juju.ubuntu.com/docs\n\n\
\
Last login: {2}";

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

$(document).ready(function() {
  $('.ui.dropdown').dropdown();
  $('.sidebar h1').click(function(e) {
    $('.sidebar .lesson.description').slideToggle();
    $('.sidebar h1 i').toggleClass('green');
  });

  $.getJSON('bower.json', function(data) {
    $('#term').terminal(function(cmd, term) {
      window.terminal = term;
      window.commands.run(cmd, term);
    }, {
      prompt: 'demo@ubuntu:~$ ',
      greetings: greet.format(data.name, data.version, (new Date()).toString()),
      tabcompletion: true,
      completion: function(term, cmd, cb) {
        cb([]);
      }
    });
  });

  window.editor = ace.edit("editor");
  window.editor.setFontSize(18);
  window.editor.getSession().setUseSoftTabs(true);
  window.editor.getSession().setUseWrapMode(true);
  window.editor.setHighlightActiveLine(true);

  $.getScript("commands/builtins.jsonp");
  $.getScript("commands/juju.jsonp");
  $.getJSON('lessons.json', function(data) {
    data.lessons.forEach(function(l) {
      // TODO: make this less ugly
      var lesson = l.split('/')[1].split('.')[0];
      window.lessons[lesson] = l;
    });
  });

  $(window).resize(function() {
    $('.scrollable').height($(window).height() - 10);
  });

  $(window).trigger('resize');
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
