const fs = require("fs");
const path = require("path");
const glob = require("glob");
const HtmlValidator = require("./HtmlValidator/HtmlValidator");
const CssValidator = require("./CssValidator/CssValidator");
const JsValidator = require("./JsValidator/JsValidator");
const debug = require("../../common/debug");

const ValidatorController = require("../baseClass/ValidatorController");
const config = require("../config");

class CodeCheckValidatorController extends ValidatorController {
    constructor(options) {
        super();
        this.options = options;
        this.validators = [];
    }


    checkOptions() {
        //关闭检查则不检查
        if (this.options.cliOptions.closeCheck) return false;
        let options = this.options.cliOptions,
            rConfigPath = path.join(this.options.cwd, config.configFileName),
            eslintPath = path.join(this.options.cwd, ".eslintrc.js"),
            rConfig;

        const checkRules = [{
            ruleId: `检查${config.configFileName}文件`,
            notPass: (options.checkCss || options.checkHtml) && !fs.existsSync(rConfigPath),
            errorMessage: `没有找到${config.configFileName}文件`,
            afterCheck: () => {
                rConfig = require(rConfigPath);
                this.options.checkOptions = rConfig;
            }
        }, {
            ruleId: `检查html配置`,
            notPass: () => {
                return options.checkHtml && typeof rConfig.htmlCheckOptions == "undefined"
            },
            errorMessage: `${config.configFileName}缺少htmlCheckOptions配置项`
        }, {
            ruleId: `检查css配置`,
            notPass: () => {
                return options.checkCss && typeof rConfig.cssCheckOptions == "undefined"
            },
            errorMessage: `${config.configFileName}缺少cssCheckOptions配置项`
        }, {
            ruleId: `检查js配置`,
            notPass: () => {
                return options.checkJs && !fs.existsSync(eslintPath)
            },
            errorMessage: `没有找到.eslintrc.js文件@${eslintPath}`
        }]

        checkRules.forEach(rule => {
            let notPass;
            if (typeof rule.notPass == "function") {
                notPass = rule.notPass();
            } else {
                notPass = rule.notPass;
            }

            if (notPass) {
                throw new Error(rule.errorMessage);
            }
            rule.afterCheck && rule.afterCheck.apply(this);
        });
    }

    /**
     * 如果checkOptions 返回了false 则不会走到dispatchTask
     */
    dispatchTask() {
        let errorMessages = {};
        this._initValidators();

        this.validators.forEach(validator => {
            errorMessages[validator.mesId] = validator.validator.run();
        });

        return errorMessages;
    }


    _initValidators() {
        this.validators = [{
            mesId: "htmlMes",
            validator: new HtmlValidator({
                cwd: this.options.cwd,
                checkOptions: this.options.checkOptions,
                cliOptions: this.options.cliOptions
            }),
        }, {
            mesId: "cssMes",
            validator: new CssValidator({
                cwd: this.options.cwd,
                checkOptions: this.options.checkOptions,
                cliOptions: this.options.cliOptions
            })
        }, {
            mesId: "jsMes",
            validator: new JsValidator({
                cwd: this.options.cwd
            })
        }];
    }

    parseOptions() {

    }

}

module.exports = CodeCheckValidatorController;