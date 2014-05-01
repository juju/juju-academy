
/**
 * Yes, I have read all the blog posts about not modifying objects you don't own
 * These all replicate the ECMAScript 6 implementations. The idea being I'm tired
 * of writing shitty code because web browsers are too slow to adopt new standards
 * Some functions don't exist, but I want them to really badly (like format) so
 * they are now in here. As new standards come out this overrides file (and
 * subsequent code that uses these overrides) should be updated to fit any new
 * ECMA specs
 */

if (typeof String.prototype.format != 'function') {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
  };
}

if (typeof String.prototype.contains != 'function') {
  String.prototype.contains = function(s) {
    return this.indexOf(s) !== -1;
  };
}

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function(s) {
    return this.indexOf(s) === 0;
  };
}
