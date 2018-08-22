const jsdom = require('jsdom');
const fs = require('fs');
const path = require('path');
const B = require('../utils/b28lib').b28lib;
const console = require('../utils/console');
const nodeGlob = require("glob");
const Validator = require("../../baseClass/Validator");
const config = require("../../config");

class JsonCodeValidator extends Validator {
    constructor(options) {
        super();
        this.name = "Json And Code Validator";
        this.description = "检查代码中的语句是否在翻译中都有翻译";
        this.options = options;
        //不需要检查的文件Exp
        this.excludes = /(Error_Report|errorLog|lang|img|.css|.svn|.git|jquery|.min.js|shiv.js|respond.js|b28|shim.js|goform|cgi-bin)/;
        //代码中的所有词条
        this.langArr = [];
        //语言包路径下所有json文件的路径
        this.jsonFiles = nodeGlob.sync(`${this.options.checkOptions.jsonPath}/**/*.json`);
        //所有js文件的路径
        this.jsFiles = nodeGlob.sync(`${this.options.cwd}/**/*.js`);
        //所有页面文件的路径
        this.pagerFiles = nodeGlob.sync(`${this.options.cwd}/**/*.*(html|htm|asp|tlp|gch)`);
        this.runningFlag = true;
        this.errorMessages = {
            errNum: 0,
            warnNum: 0,
            messages: []
        };
    }

    beforeCheck() {
        this.message("检查代码翻译是否全部在语言包中...");
    }

    afterCheck() {
        this.message("代码翻译检查完毕");
    }

    checkOptions() {
        if(!this.options.checkOptions) return ;
        let opt = this.options.checkOptions,
            rules = [{
                id: "basic",
                message: "jsonAndCode的jsonPath属性必须配置",
                notPass: !opt.jsonPath
            }, {
                id: "checkJsonPath",
                message: `@${config.configFileName}中jsonAndCode.jsonPath路径 ${path.join(this.options.cwd, opt.jsonPath)}不存在`,
                notPass: !fs.existsSync(path.join(this.options.cwd, opt.jsonPath))
            }];

        rules.forEach(rule => {
            if (rule.notPass) {
                console.log(rule.message);
                throw new Error(rule.message);
            }
        });
    }

    //@override
    check() {
        let errorData = [],
            errNum = 0,
            len,
            i;

        this._fileterFiles();
        this._getLangArr();
        len = this.langArr.length;

        this.jsonFiles.forEach(file => {
            let curErrorMessage = {
                    fileName: "",
                    errors: [],
                    errNum: 0,
                    warnNum: 0
                },
                curCheckLang = file.split("/")[file.split("/").length - 2],
                curSentence,
                transData = require(path.join(this.options.cwd, file));

            for (i = 0; i < len; i++) {
                curSentence = this.langArr[i];

                if (i == len - 1 || (curSentence && /^\/\*---/.test(curSentence))) {
                    if (curErrorMessage.errNum != 0) {
                        this.errorMessages.messages.push(curErrorMessage);
                        this.errorMessages.errNum += curErrorMessage.errNum;
                        this.errorMessages.warnNum += curErrorMessage.warnNum;
                    }

                    curErrorMessage = {
                        fileName: curSentence.split(this.options.cwd).pop().split("---")[0].trim(),
                        errors: [],
                        errNum: 0,
                        warnNum: 0
                    };
                }

                if (curSentence && !/^\/\*---/.test(curSentence) && transData[curSentence] === undefined) {
                    curErrorMessage.errors.push(`${curSentence}`);
                    curErrorMessage.errNum++;
                    curErrorMessage.lang = curCheckLang;
                }
            }
        }, this);

        return this.errorMessages;
    }

    _fileterFiles() {
        this.jsFiles = this.jsFiles.filter(fileName => {
            return !this.excludes.test(fileName);
        });
        this.pagerFiles = this.pagerFiles.filter(fileName => {
            return !this.excludes.test(fileName);
        });
    }

    _getLangArr() {
        this.jsFiles.forEach(file => {
            this.langArr = this.langArr.concat(this._getResLangData(file));
        });

        this.pagerFiles.forEach(file => {
            this.langArr = this.langArr.concat(this._getPageLangData(file));
        });
    }

    //提取html
    _getPageLangData(page) {
        let content = fs.readFileSync(page, 'utf-8');
        let document = new jsdom.JSDOM(content).window.document;
        let arr = new B.getPageData(document.documentElement, false, path.resolve(page));
        document = '';
        return arr;
    }

    //提取js
    _getResLangData(file) {
        let content = fs.readFileSync(file, 'utf-8');
        let arr = new B.getResData(content, false, path.resolve(file));
        return arr;
    }
}


module.exports = JsonCodeValidator;