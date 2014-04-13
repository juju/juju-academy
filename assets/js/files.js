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

// Use localstorage to persist files between page loads/visits
var Files = function() {
  this._files = {};
  return this;
};

Files.prototype.exists = function(f) {
  return (f in this._files);
};

Files.prototype.save = function(f, contents) {
  this._files[f] = contents;
};

Files.prototype.load = function(f) {
  if(!this.exists(f)) {
    return "";
  }
  return this._files[f];
};
