const jsdom = require('jsdom');
const fs = require('fs');
const path = require('path');
const B = require('../utils/b28lib').b28lib;
const console = require('../utils/console');
const nodeGlob = require("glob");
const Validator = require("../../baseClass/Validator");

class JsonCodeValidator extends Validator {
    constructor(options) {
        super();
        this.name = "Json And Code Validator";
        this.description = "检查代码中的语句是否在翻译中都有翻译";
        this.options = options;
        //不需要检查的文件Exp
        this.excludes = /(lang|img|.css|.svn|.git|jquery|.min.js|shiv.js|respond.js|b28|shim.js|goform|cgi-bin)/;
        //代码中的所有词条
        this.langArr = [];
        //语言包路径下所有json文件的路径
        this.jsonFiles = nodeGlob.sync(`${this.options.jsonPath}/**/*.json`);
        //所有js文件的路径
        this.jsFiles = nodeGlob.sync(`${this.options.src}/**/*.js`);
        //所有页面文件的路径
        this.pagerFiles = nodeGlob.sync(`${this.options.src}/**/*.*(html|htm|asp|tlp|gch)`);
        this.runningFlag = true;
    }

    beforeCheck() {
        console.log("检查代码翻译是否全部在语言包中...");
    }

    afterCheck() {
        console.log("代码翻译检查完毕");
    }
    
    //@override
    check() {
        let errorData = [],
            len,
            i;

        this._fileterFiles();
        this._getLangArr();
        len = this.langArr.length;

        this.jsonFiles.forEach(file => {
            let curCheckLang = file.split("/")[file.split("/").length - 2],
                curSentence,
                tpErrorData = [],
                transData = require(file);

            for (i = 0; i < len; i++) {
                curSentence = this.langArr[i];

                if (curSentence && /^\/\*---/.test(curSentence)) {
                    let fileName = curSentence.split("\\").pop().split("-")[0].trim();
                    tpErrorData.push(`/*****在 ${fileName} 文件中以下词条在 ${curCheckLang} 语言包中没有翻译*****/`);
                }

                if (curSentence && !/^\/\*---/.test(curSentence) && transData[curSentence] === undefined) {
                    tpErrorData.push(`${curSentence}`);
                }

            }
            /**如果当前文件下没有没被翻译的词条，则把这个文件的信息去掉，避免干扰*/
            for (i = 0; i < tpErrorData.length - 1; i++) {
                if (/^\/\*\*/.test(tpErrorData[i]) && /^\/\*\*/.test(tpErrorData[i + 1])) {
                    tpErrorData.splice(i, 1);
                    i--;
                }
            }
            /^\/\*\*/.test(tpErrorData[tpErrorData.length - 1]) && tpErrorData.splice(tpErrorData.length - 1, 1);

            tpErrorData.length > 1 && (errorData = errorData.concat(tpErrorData));
        });

        fs.writeFileSync(path.join(this.options.logPath, this.options.fileName), errorData.join("\n"), "utf-8");
        console.log(`文件检查已完成，错误信息文件为: ${this.options.fileName}`);
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
        //console.log("path.resolve(page)+++++++"+path.resolve(page));
        let content = fs.readFileSync(page, 'utf-8');
        let document = new jsdom.JSDOM(content).window.document;
        let arr = new B.getPageData(document.documentElement, false, path.resolve(page));
        document = '';
        //console.log("arr+++++++"+arr);
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