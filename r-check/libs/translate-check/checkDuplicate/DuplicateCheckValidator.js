const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const Validator = require("../../baseClass/Validator");

class DupValidator extends Validator {
    constructor(options) {
        super();
        this.name = "Duplicate Validator";
        this.description = "检查Excel中，是否存在两条一样的语句的情况，这样会导致一对多的翻译错误";
        this.options = options;
        this.excelDatas = [];
        this.errDatas = {
            errNum: 0,
            warnNum: 0,
            messages: []
        }
    }

    beforeCheck() {
        this.message("检查excel中的重复词条中...");
    }

    afterCheck() {
        this.message("重复词条检查完毕");
    }

    //@override
    check(options) {
        this._getExcelDatas();
        this._checkArrayDup();
        return this.errDatas;
    }

    /**
     * 检查词条中是否有重复项
     * 冒泡检查
     */
    _checkArrayDup() {
        this.excelDatas.forEach((sentence, index) => {
            let lastIndex = this.excelDatas.lastIndexOf(sentence);
            if (typeof sentence != "undefined" && lastIndex !== index) {
                this.errDatas.messages.push({
                    firstLine: index + 2,
                    lastLine: lastIndex + 2,
                    key: sentence
                });
                this.errDatas.errNum++;
            }
        });
    }

    _getExcelDatas() {
        //获取语言包的数据
        let excelDatas = xlsx.readFileSync(this.options.excelPath);
        excelDatas = xlsx.utils.sheet_to_json(excelDatas.Sheets[excelDatas.SheetNames[0]]);

        //利用array.map过滤出默认语言的数据
        excelDatas = excelDatas.map((data) => {
            return data[this.options.defaultLang];
        });

        this.excelDatas = excelDatas;
    }

}

module.exports = DupValidator;