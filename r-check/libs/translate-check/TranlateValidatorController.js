const console = require("./utils/console");
const fs = require("fs");
const path = require("path");
const ExcelJsonValidator = require("./jsonAndExcel/JsonExcelValidator");
const DupValidator = require("./checkDuplicate/DuplicateCheckValidator");
const JsonCodeValidator = require("./jsonAndCode/JsonCodeValidator");
const ValidatorController = require("../baseClass/ValidatorController");
const config = require("../config");

class TranlateValidatorController extends ValidatorController {
    constructor(options) {
        super();
        this.options = options;
        this.validators = [];
    }

    checkOptions() {
        if (!this.options.cliOptions.checkTranslate) return false;
        let options = this.options.cliOptions,
            rConfigPath = path.join(this.options.cwd, config.configFileName);

        if (!fs.existsSync(rConfigPath)) {
            throw new Error(`没有检测到${config.configFileName}配置文件`);
        }

        this.options.checkOptions = require(rConfigPath);
    }

    _initValidators() {
        this.validators = [{
            mesId: "codeJson",
            validator: new JsonCodeValidator({
                cwd: this.options.cwd,
                src: this.options.checkOptions.jsonAndCode.codePath,
                jsonPath: this.options.checkOptions.jsonAndCode.jsonPath,
                logPath: this.options.checkOptions.jsonAndCode.logPath,
                fileName: "json与代码中未对应项错误日志.txt"
            })
        }, {
            mesId: "excelJson",
            validator: new ExcelJsonValidator({
                cwd: this.options.cwd,
                checkOptions: this.options.checkOptions.jsonAndExcel
            })
        }, {
            mesId: "excel",
            validator: new DupValidator(this.options.checkOptions.checkDuplicate)
        }];
    }

    dispatchTask() {
        let errorMessages = {};

        this._initValidators();
        this.validators.forEach(validator => {
            errorMessages[validator.mesId] = validator.validator.run();
        })

        return errorMessages;
    }

}

// function translateCheck(filePath, options) {
//     //首先检查配置项是否合法，非法则抛出错误
//     let configOptions = checkOptionsValid(filePath, options);

//     //TODO:可以优化checkOptions到各个Validator中验证
//     let messages = {
//         codeJson: null,
//         excelJson: null,
//         excel: null
//     };
//     if (configOptions.jsonAndCode) {
//         let jc = new JsonCodeValidator({
//             src: configOptions.jsonAndCode.codePath,
//             jsonPath: configOptions.jsonAndCode.jsonPath,
//             logPath: configOptions.jsonAndCode.logPath,
//             fileName: "json与代码中未对应项错误日志.txt"
//         });
//         messages.codeJson = jc.run();
//     }

//     if (configOptions.jsonAndExcel) {
//         let va = new ExcelJsonValidator(configOptions.jsonAndExcel);
//         messages.excelJson = va.run();
//     }

//     if (configOptions.checkDuplicate) {
//         let dupVa = new DupValidator(configOptions.checkDuplicate);
//         messages.excel = dupVa.run();
//     }
//     return messages;
// }

// /**
//  * 检查配置项是否合法
//  * @param {*配置项} options 
//  */
// function checkOptionsValid(filePath, options) {
//     //默认配置路径为 根目录下的r.config.js
//     let configOptions,
//         configPath = path.join(filePath, "r.config.js");

//     //检查是否有配置文件，没有配置文件则不能继续进行下去
//     if (!isFileExists(path.join(filePath, "r.config.js"))) {
//         throw new Error("没有检测到r.config.js");
//     }
//     //获取文件内部的配置信息
//     configOptions = require(configPath);

//     if (!configOptions.jsonAndCode && !configOptions.jsonAndExcel) {
//         console.warn("开启了翻译检查但是没有配置任何检查项");
//     }


//     /*如果配置了json与代码匹配项，则检查如下项目
//      *1.检查是否配置了codePath选项，该选项用于定位代码的路径
//      *2.检查是否配置了jsonPath选项，该选项用于定位语言包路径
//      *3.检查路径是否配置正确且存在
//      *4.检查错误日志路径是否配置，没有配置则使用默认路径
//      *5.检查错误日志路径是否存在，没有则生成(只生成单层，不能进入第二层生成，可优化)
//      */
//     if (configOptions.jsonAndCode) {
//         if (!configOptions.jsonAndCode.codePath || !configOptions.jsonAndCode.jsonPath) {
//             throw new Error("jsonAndCode的codePath属性和jsonPath属性必须配置");
//         } else {
//             configOptions.jsonAndCode.codePath = path.join(filePath, configOptions.jsonAndCode.codePath);
//             configOptions.jsonAndCode.jsonPath = path.join(filePath, configOptions.jsonAndCode.jsonPath)
//             if (!isFileExists(configOptions.jsonAndCode.codePath) || !isFileExists(configOptions.jsonAndCode.jsonPath)) {
//                 throw new Error("jsonAndCode路径配置有错误");
//             }

//             if (!configOptions.jsonAndCode.logPath) {
//                 console.info("jsonAndCode没有配置错误日志路径，使用默认路径");
//                 configOptions.jsonAndCode.logPath = "./errorLog"
//             }
//             configOptions.jsonAndCode.logPath = path.join(filePath, configOptions.jsonAndCode.logPath);
//         }
//         //判断错误日志文件夹是否存在，不存在则创建
//         if (!isFileExists(configOptions.jsonAndCode.logPath)) {
//             console.info("错误日志文件夹不存在，创建......");
//             fs.mkdirSync(configOptions.jsonAndCode.logPath);
//         }

//     }

//     /**
//      * 如果配置了json和excel对应性检查，则检查如下配置项
//      *1.检查是否配置了excelPath选项，该选项用于定位excel文件的路径
//      *2.检查是否配置了jsonPath选项，该选项用于定位语言包路径
//      *3.检查是否配置了默认语言
//      *4.检查是否配置了需要检查的语言项
//      *5.检查路径是否配置正确且存在
//      *6.检查错误日志路径是否配置，没有配置则使用默认路径
//      *7.检查错误日志路径是否存在，没有则生成(只生成单层，不能进入第二层生成，可优化)
//      *8.检查需要检查的语言项是否为数组
//      */
//     if (configOptions.jsonAndExcel) {
//         if (!configOptions.jsonAndExcel.jsonPath || !configOptions.jsonAndExcel.excelPath || !configOptions.jsonAndExcel.defaultLang) {
//             throw new Error("jsonAndExcel中的jsonPath、excelPath、defaultLang属性必须配置");
//         } else {
//             configOptions.jsonAndExcel.jsonPath = path.join(filePath, configOptions.jsonAndExcel.jsonPath);
//             configOptions.jsonAndExcel.excelPath = path.join(filePath, configOptions.jsonAndExcel.excelPath);
//             if (!isFileExists(configOptions.jsonAndExcel.jsonPath) || !isFileExists(configOptions.jsonAndExcel.excelPath)) {
//                 throw new Error("jsonAndExcel路径配置有错误");
//             }

//             if (!isFileExists(configOptions.jsonAndExcel.excelPath)) {
//                 throw new Error("excel文件不存在");
//             }

//             if (typeof configOptions.jsonAndExcel.defaultLang != "string") {
//                 throw new Error("defaultLang配置错误");
//             }

//             if (!configOptions.jsonAndExcel.logPath) {
//                 console.info("jsonAndExcel没有配置错误日志路径，使用默认路径");
//                 configOptions.jsonAndExcel.logPath = "./errorLog";
//             }
//             configOptions.jsonAndExcel.logPath = path.join(filePath, configOptions.jsonAndExcel.logPath);
//         }
//         //判断错误日志文件夹是否存在，不存在则创建
//         if (!isFileExists(configOptions.jsonAndExcel.logPath)) {
//             console.info("错误日志文件夹不存在，创建......");
//             fs.mkdirSync(configOptions.jsonAndExcel.logPath);
//         }
//     }
//     /**
//      * 如果配置了excel重复词条，则检查如下配置项
//      *1.检查是否配置了excelPath选项，该选项用于定位excel文件的路径
//      *2.检查是否配置了默认语言
//      */
//     if (configOptions.checkDuplicate) {
//         if (!configOptions.checkDuplicate.excelPath) {
//             throw new Error("checkDuplicate检查重复词条必须配置excelPath选项");
//         }
//         if (typeof configOptions.checkDuplicate.excelPath != "string") {
//             throw new Error("excelpath 必须为路径");
//         }
//         if (!configOptions.checkDuplicate.defaultLang) {
//             throw new Error("checkDuplicate必须配置defaultLang选项");
//         }
//         configOptions.checkDuplicate.excelPath = path.join(filePath, configOptions.checkDuplicate.excelPath);
//         configOptions.checkDuplicate.logPath = path.join(filePath, configOptions.checkDuplicate.logPath);
//     }

//     return configOptions;
// }

// /**
//  * 检查文件是否存在
//  * @param {*文件路径} filePath 
//  */
// function isFileExists(filePath) {
//     return fs.existsSync(filePath);
// }


module.exports = TranlateValidatorController;