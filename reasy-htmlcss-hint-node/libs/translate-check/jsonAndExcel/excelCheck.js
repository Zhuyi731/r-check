const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const nodeGlob = require("glob");
const console = require("../utils/console");

var jsonPath,
    excelPath,
    logPath,
    errFile,
    defaultLang,
    langToCheck;

var jsonDatas,
    excelDatas,
    errorDatas = [],
    langArr = [];

/*for debug start
checkJsonAndExcel({
   jsonPath: "./app/common/lang",
   excelPath: "./docs/O3.xlsx",
   logPath: "./errCode",
   errFile: "hahha.txt",
   defaultLang: "en",
   langToCheck: ["cn"]
});
//  for debug end */

/**
 * 检查函数入口，检查json文件是否与excel文件对应
 * @param {*webpack配置参数} webpackOptions 
 */
function checkJsonAndExcel(webpackOptions) {

    //解析options
    parseOptions(webpackOptions);
    //获取excel的数据并储存在excelDatas里
    getExcelDatas();
    //检查langToCheck中的语言和defaultLang中的语言是否在excel中有对应key值
    checkLangIsIlegal();

    let files = nodeGlob.sync(jsonPath + "/**/*.json");

    //遍历json文件，对langToCheck中的语言进行检查
    files.forEach((file) => {
        //检查该语言是否在langToCheck中，如果没有则不检查
        let checkLang = fileToCheck(file);
        if (!checkLang) {
            return;
        }

        console.info(`检查${checkLang}语言中......`);

        errorDatas[errorDatas.length - 1] != " " && errorDatas.push(" ");
        errorDatas.push(`/********************Language === ${checkLang}********************/`)

        //获取JSON文件的数据并储存在jsonDatas里
        getJsonDatas(file);

        //检查excel文件中的词条是否在json中
        checkExcelInJson(checkLang);
        console.info(`${checkLang}语言检查完毕`);
        errorDatas.push(`/********************Language === ${checkLang}********************/`)
    });

    if (!fs.existsSync(logPath)) {
        fs.mkdir(logPath);
    }

    fs.writeFileSync(path.join(logPath, errFile), errorDatas.join("\r\n"));
    console.info(`所有语言检查已完成，错误信息文件为${errFile}`);

}

/**
 * 检查excel中的词条是否在json中有
 * 检查excel中的词条是否与json中的一致
 * @param {*当前检测的语言} checkLang 
 */
function checkExcelInJson(checkLang) {
    let key;

    excelDatas.forEach((rowData) => {
        key = rowData[defaultLang];
        errorDatas[errorDatas.length - 1] != " " && errorDatas.push(" ");
        if (typeof jsonDatas[key] == "undefined") {
            errorDatas.push("/--------------------/");
            errorDatas.push(`key = {${key}} is not in json`);
            errorDatas.push("/--------------------/");
        } else if (rowData[checkLang] !== jsonDatas[key]) {
            errorDatas.push("/--------------------/");
            errorDatas.push(`key = {${key}} is not the same in json and excel`);
            errorDatas.push(`json = ${jsonDatas[key]}`);
            errorDatas.push(`excel = ${rowData[checkLang]}`);
            errorDatas.push("/--------------------/");
        }
    })

}

/**
 * 检查defaulLang配置是否合法
 * 检查langToCheck配置是否合法
 */
function checkLangIsIlegal() {
    if (langArr.indexOf(defaultLang) === -1) {
        throw new Error(`defaultLang:{${defaultLang}}在excel中没有对应的key值`);
    }

    langToCheck.forEach((lang) => {
        if (langArr.indexOf(lang) === -1) {
            throw new Error(`langToCheck中{${lang}}选项在excel中没有对应的key值`);
        }
    });

}


/**
 * 获取excel数据以及langArr数据
 */
function getExcelDatas() {
    excelDatas = xlsx.readFileSync(excelPath);
    excelDatas = xlsx.utils.sheet_to_json(excelDatas.Sheets[excelDatas.SheetNames[0]]);

    for (let prop in excelDatas[0]) {
        if (excelDatas[0].hasOwnProperty(prop) && prop !== "__rowNum__") {
            langArr.push(prop);
        }
    }

}

/**
 * 获取JSON文件的数据
 * @param {文件路径}filePath
 */
function getJsonDatas(filePath) {
    jsonDatas = fs.readFileSync(filePath, "utf-8");
    jsonDatas = JSON.parse(jsonDatas);
}

/**
 * 检查文件名是否在langToCheck中
 * @param {*文件名} fileName 
 */
function fileToCheck(fileName) {
    let ret = false;
    langToCheck.forEach((lang) => {
        let fileReg = new RegExp(`${lang}/translate.json`);
        if (fileReg.test(fileName)) {
            ret = lang;
            return;
        }
    });
    //没有匹配的语言则不那个
    return ret;
}

/**
 * 解析webpack配置参数
 * @param {*配置参数} options 
 */
function parseOptions(options) {
    //json路径文件夹
    jsonPath = options.jsonPath;
    //语言包路径
    excelPath = options.excelPath;
    //错误日志输出路径
    logPath = options.logPath;
    //默认语言
    defaultLang = options.defaultLang;
    //需要检查的语言
    langToCheck = options.langToCheck;
    //错误日志文件名
    (typeof options.errFile == "undefined") ? (errFile = "json与excel中未对应项错误日志.txt") : (errFile = options.errFile);
}

module.exports = checkJsonAndExcel;