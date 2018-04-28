const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const debug = require("../../../common/debug");

function checkDup(options) {
    let excelDatas,
        langArrs = [],
        errorInfo = [],
        excelPath = options.excelPath,
        defaultLang = options.defaultLang,
        logPath = options.logPath || "./errorLog";

    if (!fs.existsSync(path.join(process.cwd(), excelPath))) {
        throw new Error("没有找到对应的语言包文件  路径" + path.join(process.cwd(), excelPath));
    }

    langArrs = getExcelDatas(excelPath, defaultLang);

    //检查该数组是否重复
    errorInfo = checkArrayDup(langArrs);

    if (errorInfo.length > 2) {
        console.warn(`[WARNING]:检查到${errorInfo.length-2}条重复词条，请检查语言包。详细错误信息请见${logPath}/重复词条.txt`);
    }

    debug(errorInfo);
    fs.writeFileSync(path.join(process.cwd(), logPath, "重复词条.txt"), errorInfo.join("\n\r\n\r"));

}

/**
 * 检查数组中是否有重复的项
 * @param {*数组} langArrs 
 */
function checkArrayDup(langArrs) {
    let errorInfo = ["/********重复词条********/"];

    langArrs.forEach(function (element) {
        if (typeof element != "undefined" && langArrs.lastIndexOf(element) !== langArrs.indexOf(element) && errorInfo.indexOf(element) === -1) {
            errorInfo.push(element);
        }
    });

    errorInfo.push("/********重复词条********/");
    return errorInfo;
}

/**
 * 获取excel中的数据
 * @param {*excel路径} excelPath 
 * @param {*默认语言} defaultLang 
 */
function getExcelDatas(excelPath, defaultLang) {
    //获取语言包的数据
    let excelDatas = xlsx.readFileSync(path.join(process.cwd(), excelPath));
    excelDatas = xlsx.utils.sheet_to_json(excelDatas.Sheets[excelDatas.SheetNames[0]]);

    //利用array.map过滤出默认语言的数据
    excelDatas = excelDatas.map((data) => {
        return data[defaultLang];
    });

    return excelDatas;
}

module.exports = checkDup;