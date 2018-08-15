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
    }

    beforeCheck(){
        console.log("检查excel中的重复词条");
    }

    afterCheck(){
        console.log("重复词条检查完毕");
    }

    //@override
    check(options) {
        let excelDatas,
            langArrs = [],
            errorInfo = [],
            excelPath = this.options.excelPath,
            defaultLang = this.options.defaultLang,
            logPath = this.options.logPath || "./errorLog";

        if (!fs.existsSync(excelPath)) {
            throw new Error("没有找到对应的语言包文件路径" + excelPath);
        }

        langArrs = this._getExcelDatas(excelPath, defaultLang);
        //检查该数组是否重复
        errorInfo = this._checkArrayDup(langArrs);

        this.debug(errorInfo);
        fs.writeFileSync(path.join(logPath, "重复词条.txt"), errorInfo.join("\n\r\n\r"));
    }

    /**
     * 检查词条中是否有重复项
     * 冒泡检查
     * @param {*Excel中的词条} langArrs 
     */
    _checkArrayDup(langArrs) {
        let errorInfo = ["/********重复词条********/"];

        langArrs.forEach(function (element) {
            if (typeof element != "undefined" && langArrs.lastIndexOf(element) !== langArrs.indexOf(element) && errorInfo.indexOf(element) === -1) {
                errorInfo.push(element);
            }
        });

        errorInfo.push("/********重复词条********/");
        return errorInfo;
    }

    _getExcelDatas(excelPath, defaultLang) {
        //获取语言包的数据
        let excelDatas = xlsx.readFileSync(excelPath);
        excelDatas = xlsx.utils.sheet_to_json(excelDatas.Sheets[excelDatas.SheetNames[0]]);

        //利用array.map过滤出默认语言的数据
        excelDatas = excelDatas.map((data) => {
            return data[defaultLang];
        });

        return excelDatas;
    }

}

module.exports = DupValidator;