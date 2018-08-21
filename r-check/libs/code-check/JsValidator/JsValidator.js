/**
 * @added by zy  17/12/16
 * @rewrite @18/3/20
 * @change log
 * 通过Validator 继承重写此验证器 @18.8.16
 * @change log end
 */

const eslint = require("eslint/lib/cli");
const path = require("path");
const fs = require("fs");
const util = require("../../../common/utils");
const Validator = require("../../baseClass/Validator");
const config = require("../../config");

class JsValidator extends Validator {
    constructor(options) {
        super();
        this.name = "JS Validator";
        this.description = "通过ESLint检查基本的JS语法规范";
        this.options = options;
        this.globalExcludes = /(node_modules|goform)/;
        this.result = {
            messages: [],
            errNum: 0,
            warnNum: 0
        };
    }

    beforeCheck() {
        this.message("开始JS检查");
    }

    afterCheck() {
        this.message(`JS检查共发现${this.result.warnNum}个警告`, true);
        this.message(`JS检查共发现${this.result.errNum}个错误`, true);
        this.message("JS检查结束");
    }

    check() {
        this.errorLogPath = path.join(this.options.cwd, config.errorLogPath),
            util.isLogExist(this.errorLogPath, path.join(this.errorLogPath, "/js"));
        this._executeCheck();
        this._getResult();

        return this.result;
    }

    _executeCheck() {
        //Html版本
        // eslint.execute(["eslint", this.options.cwd, "-o", `${this.errorLogPath}/js/errorLog.json`, "-f", "html", "./"]);
        //Json版本
        eslint.execute(["eslint", this.options.cwd, "-o", `${this.errorLogPath}/js/errorLog.json`, "-f", "json", "./"]);
    }

    _getResult() {
        let json = require(`${this.errorLogPath}/js/errorLog.json`),
            messages = json.messages;

        json.forEach(error => {
            this.result.errNum += error.errorCount;
            this.result.warnNum += error.warningCount;
            if (error.errorCount || error.warningCount) {
                this.result.messages.push({
                    fileName: error.filePath.split(this.options.cwd)[1],
                    errors: error.messages,
                    errNum: error.errorCount,
                    warnNum: error.warningCount
                });
            }
        });
    }
}

module.exports = JsValidator;