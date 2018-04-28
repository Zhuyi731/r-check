'use strict';

module.exports = (function(console) {
    var _console = {};
    for (var prop in console) {
        _console[prop] = (function(p) {
           return function() {
               console.log('\r\n');
               arguments[0] = '[' + p.toUpperCase() + ']: ' + arguments[0];
               console[p].apply(console, arguments);
               console.log('\r\n');
           }
        })(prop);
    }
    return _console;
})(console);

