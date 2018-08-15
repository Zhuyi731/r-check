const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const nodeGlob = require("glob");
const console = require("../utils/console");
const Validator = require("../../baseClass/Validator");

class ExcelJsonValidator extends Validator {
    constructor(options) {
        super();
        this.name = "Excel And Json Validator";
        this.description = "检查json文件中的翻译是否和excel中的翻译一致。避免出现翻译错误的情况";
        this.options = options;
        this.options.errFile = "json与excel中未对应项错误日志.txt";
        //excel中的语言数组
        this.langArr = [];
        //
        this.file = null;
        //
        this.dirs = null;
        //excel语言报数据
        this.excelDatas = null;
        //json数据
        this.jsonDatas = null;
        //检查出的错误数据
        this.errorDatas = [];
    }

    beforeCheck() {
        console.log("检查语言包与excel是否对应");
    }

    afterCheck() {
        console.log("语言包与excel检查完毕");
    }

    //@override
    check() {
        let file,
            dirs,
            checklangArr = [];

        //获取excel的数据并储存在excelDatas里
        this._getExcelDatas();
        //检查langToCheck中的语言和defaultLang中的语言是否在excel中有对应key值
        this._checkLangIsIlegal();


        dirs = fs.readdirSync(this.options.jsonPath);
        dirs.forEach(dir => {
            fs.statSync(path.join(this.options.jsonPath, dir)).isDirectory() && checklangArr.push(dir);
        });

        checklangArr.forEach(checkLang => {
            console.info(`检查${checkLang}语言中......`);

            this.errorDatas[this.errorDatas.length - 1] != " " && this.errorDatas.push(" ");
            this.errorDatas.push(`/********************Language === ${checkLang}********************/`)

            file = nodeGlob.sync(`${this.options.jsonPath}/${checkLang}/*.json`)[0];
            //获取JSON文件的数据并储存在jsonDatas里
            this.jsonDatas = require(file);

            //检查excel文件中的词条是否在json中
            this._checkExcelInJson(checkLang);
            console.info(`${checkLang}语言检查完毕`);
            this.errorDatas.push(`/********************Language === ${checkLang}********************/`)
        });

        if (!fs.existsSync(this.options.logPath)) {
            fs.mkdir(this.options.logPath);
        }

        fs.writeFileSync(path.join(this.options.logPath, this.options.errFile), this.errorDatas.join("\r\n"));
    }

    _getExcelDatas() {
        this.excelDatas = xlsx.readFileSync(this.options.excelPath);
        this.excelDatas = xlsx.utils.sheet_to_json(this.excelDatas.Sheets[this.excelDatas.SheetNames[0]]);

        for (let prop in this.excelDatas[0]) {
            if (this.excelDatas[0].hasOwnProperty(prop) && prop !== "__rowNum__") {
                this.langArr.push(prop);
            }
        }
    }

    _checkLangIsIlegal() {
        if (this.langArr.indexOf(this.options.defaultLang) === -1) {
            throw new Error(`defaultLang:{${this.options.defaultLang}}在excel中没有对应的key值`);
        }
    }

    _checkExcelInJson(checkLang) {
        let key;

        this.excelDatas.forEach((rowData) => {
            key = rowData[this.options.defaultLang];
            this.errorDatas[this.errorDatas.length - 1] != " " && this.errorDatas.push(" ");
            if (typeof this.jsonDatas[key] == "undefined") {
                this.errorDatas.push("/--------------------/");
                this.errorDatas.push(`key = {${key}} is not in json`);
                this.errorDatas.push("/--------------------/");
            } else if (rowData[checkLang] !== this.jsonDatas[key]) {
                this.errorDatas.push("/--------------------/");
                this.errorDatas.push(`key = {${key}} is not the same in json and excel`);
                this.errorDatas.push(`json = ${this.jsonDatas[key]}`);
                this.errorDatas.push(`excel = ${rowData[checkLang]}`);
                this.errorDatas.push("/--------------------/");
            }
        });

    }
}

module.exports = ExcelJsonValidator;