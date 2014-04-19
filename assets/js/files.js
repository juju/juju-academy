
// Use localstorage to persist files between page loads/visits
var Files = function() {
  this._files = {};
  this.storage = $.localStorage;

  return this;
};

Files.prototype.exists = function(f) {
  this.load();
  return (f in this._files);
};

Files.prototype.save = function(f, contents) {
  this._files[f] = contents;
  this.sync();
};

Files.prototype.open = function(f) {
  this.load();
  if(!this.exists(f)) {
    return "";
  }
  return this._files[f];
};

Files.prototype.sync = function() {
  this.storage.set('fs', this._files);
};

Files.prototype.load = function() {
  this._files = this.storage.get('fs');
  if(!this._files) {
    this._files = {};
  }
};

Files.prototype.clear = function() {
  this.storage.remove('fs');
};
