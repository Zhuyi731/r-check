
code = "var a = 123;var a = b;debugger";

var LintStream = require('jslint').LintStream;

var options = {
    "edition": "latest",
    "length": 100
},
    l = new LintStream(options);
    var fileName = "code/js/advanced.js", fileContents = code;
    l.write({file: fileName, body: fileContents});

    l.on('data', function (chunk, encoding, callback) {
        // chunk is an object
    
        // chunk.file is whatever you supplied to write (see above)
        // assert.deepEqual(chunk.file, fileName);
console.log(chunk.file);
console.log(chunk.linted.errors);
    
        // chunk.linted is an object holding the result from running JSLint
        // chunk.linted.ok is the boolean return code from JSLINT()
        // chunk.linted.errors is the array of errors, etc.
        // see JSLINT for the complete contents of the object
    
        // callback();
    });

    // JSLINT = node_jslint.load("code/js/advanced.js");

// for(var prop in JSLINT){
//     console.log(prop + " " +typeof JSLINT[prop]);
// }
