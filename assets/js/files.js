
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
