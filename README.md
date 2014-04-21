# Juju Academy

This site is designed to be a split pane terminal emulator to help introduce
people to the concepts of Juju before having to ever install Juju. While Juju
is arguably best learned by simply installing and doing, this site is designed
to get people started up just as fast.

# Installation

You'll need bower to run this.

    npm install -g bower

Then install all the bower things

    bower install

# Creating new lessons

Lessons are jsonp files stored in the lessons directory. The format is relatively light weight and only requires a few keys wrapped in a `load_lesson` call.

 - `name` - The title of the lesson
      ```
      'name': 'Title of lesson',
      ```
 - `description` - An array/list of paragraphs which discuss the lesson
      ```
      'description': [
        'First paragraph',
        'second paragraph',
        'last paragraph'
      ]
      ```
 - `tasks` - This is an object which each key being a unique identifier for the task

## Creating tasks

A task is an object with several keys which outlines how the task is to be satisfied.

 - `name` - The title of the task
 - `hint` - A brief description of to help the user along if they get stuck
 - `validate` - This can either be a string, an object, or a function.
   * `String` - This should be a regular expression, used to determine if the task has been completed
   * `Object` - An object containing at least a `match` key, which is a regular expression. An additional `echo` key can be added to provide additional output to the terminal
   * `Function` - If a function, should implement a signature of `Function(cmd, term, next)` where `cmd` is the full command by the user, term is the terminal instance, and next is the function invoked when there isn't a match, passing at least a `True` or string as the first and only parameter.

### Examples

```javascript
{
  '00-first-task': {
    'name': 'First task!',
    'hint': 'Type, <code>first</code> to achieve this task',
    'validate': '^first$'
  },
  '01-second-task': {
    'name': 'Second task',
    'hint': 'Do this secondly',
    'validate': {
      'match': '^second .*$',
      'echo': 'This option is optional'
    }
  },
  '02-third-task': {
    'name': 'Last task!',
    'hint': 'This is the last one',
    'validate': function(cmd, term, next) {
      var m = cmd.match('^last (.*)$');
      if(!m) {
        return next(true);
      }
      term.echo('You said {0}'.format(m[1]));
      return next();
    }
  }
}
```

# Creating new commands
