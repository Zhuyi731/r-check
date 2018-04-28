const codeCheck = require("./code-check/sourceCodetest");
const translateCheck = require("./translate-check/transCheck");
const encodeCheck = require("./encode-check/checkEncode");

function entry(path, options) {
//all the logic is in its special check folder
//this file is just a file to control 
  
    if (!options.closeCheck) {
        codeCheck(path, options);
    }

    if (options.checkTranslate) {
        translateCheck(path, options);
    }

    if (options.checkEncode) {
        encodeCheck(path, options);
    }



}

module.exports = entry;