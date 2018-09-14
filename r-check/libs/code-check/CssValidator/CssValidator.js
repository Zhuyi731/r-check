/**
 * @added by zy  17/12/16
 * @rewrite @18/3/20
 * @change log
 * 通过Validator 继承重写此验证器 @18.8.16
 * @change log end
 */
const fs = require("fs");
const path = require("path");
const util = require("./../../../common/utils");
const cssLint = require("../../../custom-csslint/dist/csslint-node").CSSLint;
const Validator = require("../../baseClass/Validator");
const config = require("../../config");
const glob = require("glob");

class CssValidator extends Validator {
    constructor(options) {
        super();
        this.name = "CSS Validator";
        this.description = "检查基本的CSS代码规范";
        this.options = options;
        this.globalExcludes = /(node_modules|goform)/;
        this.result = {
            messages: [],
            errNum: 0,
            warnNum: 0
        };
    }

    beforeCheck() {
        this.message("开始CSS检查");
    }

    afterCheck() {
        this.message(`CSS检查共发现${this.result.errNum}个错误 @tag:CSS`, true);
        this.message("CSS检查结束");
    }

    check() {
        this._getCssFileList();
        this._checkCssFiles();

        return this.result;
    }

    _getCssFileList() {
        this.cssList = glob.sync("**/*.css");
    }

    _checkCssFiles() {
        this.cssList.forEach(filePath => {
            let code,
                verifyResult;
            //过滤Exclude的内容
            if (this.globalExcludes.test(filePath) || (this.options.checkOptions.exclude && this.options.checkOptions.exclude.test(filePath))) {
                return;
            }
            this.debug("当前检测文件:" + filePath);
            code = fs.readFileSync(filePath, "utf-8");
            verifyResult = cssLint.verify(code, this.options.checkOptions.cssCheckOptions).messages;
            if (verifyResult.length > 0) {
                this.result.messages.push({
                    fileName: filePath,
                    errors: verifyResult,
                    errNum: verifyResult.length,
                    warnNum:0
                })
            }
            this.result.errNum += verifyResult.length;
        });
    }

}

module.exports = CssValidator;