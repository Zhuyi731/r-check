const path = require("path");

class ValidatorController {
    constructor(options) {
        this.options = options;
    }

    checkOptions() {}

    /**
     * 分发任务给下级Validator
     */
    dispatchTask() {
        throw new Error("You must override the method dispatchTask() of ValidatorContoller entity");
    }

    parseOptions() {

    }

    run() {
        let errorMessages = "";
        this.parseOptions();
        if (this.checkOptions() != false) {
            errorMessages = this.dispatchTask(this.options);
        }
        return errorMessages;
    }

    message(mes, noWrap = false) {
        console.log("");
        console.log("");
        !noWrap && (mes = `/***************${mes}********************/`);
        console.log(mes);
        console.log("");
        console.log("");
    }

}

module.exports = ValidatorController;