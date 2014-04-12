$(document).ready(function() {
  //$('.filter.menu .item').tab();
  $('.ui.rating').rating({
    clearable: true
  });

  // $('.ui.sidebar').sidebar('attach events', '.launch.button');

  $('.ui.dropdown').dropdown();
});

greet = "Welcome to Juju Academy (juju-academy 0.0.1 web)\n\n\
\
 * Documentation:  https://help.juju.academy\n\n\
\
Last login: Sat Apr 12 15:34:53 2014"

jQuery(function($) {
  $('#term').terminal(function(cmd, term) {
    if(cmd !== '' ) {
      term.echo('You typed a command, congrats');
    }
  }, {
    prompt: 'demo@ubuntu:~$ ',
    greetings: greet
  });
});
