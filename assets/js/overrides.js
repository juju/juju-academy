if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
  };
}

if (!Function.prototype.bind) { // check if native implementation available
  Function.prototype.bind = function(){
    var fn = this,
        args = Array.prototype.slice.call(arguments),
        object = args.shift();
    return function() {
      return fn.apply(object, args.concat(Array.prototype.slice.call(arguments)));
    };
  };
}
