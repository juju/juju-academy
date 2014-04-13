var Commands = function() {
  this._cfg = {'commands': []};
  return this;
}

Commands.prototype.add = function(match, priority) {
  if(match instanceof String) {
    var runner = function(cmd, term, next) {
      var _m = match;
      match.match = _m;
      match.echo = "";
    }
  }

  if($.isFunction(match)) {
    var runner = match;
  } else {
    var runner = function(cmd, term, next) {
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
}

Commands.prototype.run = function(cmd, term) {
  this._exec(cmd, term, 0);
}

Commands.prototype._exec = function(cmd, term, key) {
  var self = this;
  this._cfg.commands[key](cmd, term, function() {
    key++;
    self._exec(cmd, term, key);
  });
}
