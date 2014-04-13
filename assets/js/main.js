var greet = "Welcome to Juju Academy (juju-academy 0.0.1 web)\n\n\
\
 * Documentation:  https://help.juju.academy\n\n\
\
Last login: Sat Apr 12 15:34:53 2014"

function load_lesson(l) {
  $('.sidebar h1 .content').text(l['name']);
  if(l['description'] instanceof Array) {
    l['description'] = l['description'].join('</p><p>');
  }
  $('.sidebar .lesson.description').html('<p>' + l['description'] + '</p>');
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
    if(cmd !== '' ) {
      term.echo('You typed a command, congrats');
    }
  }, {
    prompt: 'demo@ubuntu:~$ ',
    greetings: greet
  });

  $.getScript("lessons/01-set-up-juju.jsonp");
});
