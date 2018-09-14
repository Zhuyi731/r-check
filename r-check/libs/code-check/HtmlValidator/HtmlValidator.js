/**
 * html的语法检查
 * 通过htmlhint这个插件来实现自定义的检查项
 */
const fs = require("fs");
const path = require("path");
const util = require("./../../../common/utils");
const HTMLHint = require("../../../custom-htmlhint/lib/htmlhint").HTMLHint;

const Validator = require("../../baseClass/Validator");
const config = require("../../config");
const glob = require("glob");

/**
 * @added by zy @17/12/16
 * @rewrite @18/3/30
 * @rewrite @18/8/15
 * @change log
 * 抛弃readline的方法来读取文件 @17/12/16
 * 完全通过HTMLHint来实现自定义 @18/3/30
 * 通过继承Validator来同一风格，便于扩展 @18/8/15
 * @change log end
 */
class HtmlValidator extends Validator {
    constructor(options) {
        super();
        this.name = "HTML Validator";
        this.description = "检查基本的HTML语法规范";
        this.options = options;
        this.htmlList = null;
        this.globalExcludes = /(node_modules|goform)/;
        this.result = {
            messages: [],
            errNum: 0,
            warnNum: 0
        };
    }

    beforeCheck() {
        this.message("开始HTML检查");
    }

    afterCheck() {
        this.message(`HTML检查共发现${this.result.errNum}个错误 @tag:HTML`,true);
        this.message("HTML检查结束");
    }

    check() {
        this._getHtmlFileList();
        this._checkHtmlFiles();

        return this.result;
    }

    _getHtmlFileList() {
        this.htmlList = glob.sync("**/*.*(html|gch|htm|tpl|asp)");
    }

    _checkHtmlFiles() {
        this.htmlList.forEach(filePath => {
            let code,
                verifyResult;
            //过滤Exclude的内容
            if (this.globalExcludes.test(filePath) || (this.options.checkOptions.exclude && this.options.checkOptions.exclude.test(filePath))) {
                return;
            }
            this.debug("当前检测文件:" + filePath);
            code = fs.readFileSync(filePath, "utf-8");
            verifyResult = HTMLHint.verify(code, this.options.checkOptions.htmlCheckOptions);
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

module.exports = HtmlValidator;