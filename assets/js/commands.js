if (!Function.prototype.bind) { // check if native implementation available
  Function.prototype.bind = function(){
    var fn = this, args = Array.prototype.slice.call(arguments),
        object = args.shift();
    return function(){
      return fn.apply(object,
        args.concat(Array.prototype.slice.call(arguments)));
    };
  };
}

var Commands = function() {
  this._cfg = {'commands': []};
  return this;
};

Commands.prototype.add = function(match, priority) {
  var runner;
  if(match instanceof String) {
    runner = function(cmd, term, next) {
      var _m = match;
      match.match = _m;
      match.echo = "";
    };
  }

  if($.isFunction(match)) {
    runner = match;
  } else {
    runner = function(cmd, term, next) {
      if(!cmd.match(match.match)) {
        return next();
      }
      return term.echo(match.echo);
    };
  }

  if(priority) {
    return this._cfg.commands.unshift(runner);
  }

  return this._cfg.commands.push(runner);
};

Commands.prototype.run = function(cmd, term) {
  this._exec(cmd, term, 0);
};

Commands.prototype._exec = function(cmd, term, key) {
  var self = this;
  this._cfg.commands[key](cmd, term, function() {
    key++;
    if(key < self._cfg.commands.length) {
      return self._exec(cmd, term, key);
    } else {
      var ex = cmd.split(' ')[0];
      term.error(ex + ": command not found");
    }
  });
};
