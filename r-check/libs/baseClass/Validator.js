class Validator {
    constructor() {
    }

    /**
     * 如果需要校验配置参数，重写此方法
     * @param {*校验器的配置} opt 
     */
    checkOptions(opt) {
        return true
    }

    /**
     * 如果需要对参数进行处理，重写此方法
     * @param {*校验器配置参数} opt 
     */
    parseOptions(opt) {
        return opt;
    }

    //this is the entry for each Validator entity   
    //you should call this method to run your custom Validator
    run() {
        this.beforeCheck();
        this.parseOptions();
        this.checkOptions();
        let result = this.check();
        this.afterCheck();
        return result;
    }

    //@override required
    //you should override this method to let your Validator work; 
    check() {
        throw new Error("你必须重写此方法");
    }

    beforeCheck() {
        console.log(`${this.name}校验器开始验证`);
    }

    afterCheck() {
        console.log(`${this.name}校验器验证完毕`);
    }

    message(mes, noWrap = false) {
        console.log("");
        console.log("");
        !noWrap && (mes = `/***************${mes}********************/`);
        console.log(mes);
        console.log("");
        console.log("");
    }

    debug() {
        if (!global.debug) {
            return;
        }
        if (arguments.length > 1) {
            console.log("");
            console.log("[DEBUG]:  ", ...arguments);
            console.log("");
            return;
        }

        if (typeof obj == "string") {
            console.log("");
            console.log(`[DEBUG]:  ${obj}`);
            console.log("");
        } else if (typeof obj == "object") {

            console.log("");
            console.dir("[DEBUG]:");
            Array.isArray(obj) ? console.log(obj.join(",")) : logObj(obj);
            console.log("");
        } else {
            console.log(obj.toString());
        }
    }

}

module.exports = Validator;