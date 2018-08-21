const fs = require("fs");
const path = require("path");
const EncodeValidator = require("./EncodeValidator/EncodeValidator");
const ValidatorController = require("../baseClass/ValidatorController");

class EncodeCheckValidatorController extends ValidatorController {
    constructor(options) {
        super();
        this.options = options;
    }

    checkOptions() {
        if (!this.options.cliOptions.checkEncode) return false;
    }

    dispatchTask() {
        let encodeValidator = new EncodeValidator(this.options);
        return encodeValidator.run();
    }
}

module.exports = EncodeCheckValidatorController;