const console = require("./utils/console");
const fs = require("fs");
const path = require("path");
const checkJsonCode = require("./node_b28");
const checkJsonExcel = require("./jsonAndExcel/excelCheck");
const checkDup = require("./checkDuplicate/checkDup");
const debug = require("../../common/debug");

function translateCheck(filePath, options) {
    //首先检查配置项是否合法，非法则抛出错误
    let configOptions = checkOptionsValid(filePath, options);
    
    if (configOptions.jsonAndCode) {
        console.log("检查语言包与代码翻译中");
        checkJsonCode(configOptions.jsonAndCode.codePath, configOptions.jsonAndCode.jsonPath, configOptions.jsonAndCode.logPath, "json与代码中未对应项错误日志.txt");
        console.log("语言包与代码翻译检查完毕");
    }

    if (configOptions.jsonAndExcel) {
        console.log("检查语言包与excel是否对应");
        checkJsonExcel(configOptions.jsonAndExcel);
        console.log("语言包与excel检查完毕");
    }

    if (configOptions.checkDuplicate) {
        console.log("检查excel中的重复词条");
        checkDup(configOptions.checkDuplicate);
        console.log("重复词条检查完毕");
    }

}

/**
 * 检查配置项是否合法
 * @param {*配置项} options 
 */
function checkOptionsValid(filePath, options) {
    //默认配置路径为 根目录下的r.config.js
    let configOptions,
        configPath = path.join(filePath, "r.config.js");

    //检查是否有配置文件，没有配置文件则不能继续进行下去
    if (options.optionsPath === null) {
        if (!isFileExists(path.join(filePath, "r.config.js"))) {
            throw new Error("开启了翻译检测但是没有配置检测文件，请使用-P <filePath>来配置配置文件路径")
        }
    } else {
        configPath = path.join(filePath, options.optionsPath);
    }
    //获取文件内部的配置信息
    configOptions = require(configPath);

    if (!configOptions.jsonAndCode && !configOptions.jsonAndExcel) {
        console.warn("开启了翻译检查但是没有配置任何检查项");
    }


    /*如果配置了json与代码匹配项，则检查如下项目
     *1.检查是否配置了codePath选项，该选项用于定位代码的路径
     *2.检查是否配置了jsonPath选项，该选项用于定位语言包路径
     *3.检查路径是否配置正确且存在
     *4.检查错误日志路径是否配置，没有配置则使用默认路径
     *5.检查错误日志路径是否存在，没有则生成(只生成单层，不能进入第二层生成，可优化)
     */
    if (configOptions.jsonAndCode) {
        if (!configOptions.jsonAndCode.codePath || !configOptions.jsonAndCode.jsonPath) {
            throw new Error("jsonAndCode的codePath属性和jsonPath属性必须配置");
        } else {
            debug("codePath", configOptions.jsonAndCode.codePath, !isFileExists(configOptions.jsonAndCode.codePath));
            debug("jsonPath", configOptions.jsonAndCode.jsonPath, !isFileExists(configOptions.jsonAndCode.jsonPath));

            if (!isFileExists(configOptions.jsonAndCode.codePath) || !isFileExists(configOptions.jsonAndCode.jsonPath)) {
                throw new Error("jsonAndCode路径配置有错误");
            }

            if (!configOptions.jsonAndCode.logPath) {
                console.info("jsonAndCode没有配置错误日志路径，使用默认路径");
                configOptions.jsonAndCode.logPath = "./errorLog"
            }
        }
        //判断错误日志文件夹是否存在，不存在则创建
        if (!isFileExists(configOptions.jsonAndCode.logPath)) {
            console.info("错误日志文件夹不存在，创建......");
            fs.mkdirSync(configOptions.jsonAndCode.logPath);
        }
    }

    /**
     * 如果配置了json和excel对应性检查，则检查如下配置项
     *1.检查是否配置了excelPath选项，该选项用于定位excel文件的路径
     *2.检查是否配置了jsonPath选项，该选项用于定位语言包路径
     *3.检查是否配置了默认语言
     *4.检查是否配置了需要检查的语言项
     *5.检查路径是否配置正确且存在
     *6.检查错误日志路径是否配置，没有配置则使用默认路径
     *7.检查错误日志路径是否存在，没有则生成(只生成单层，不能进入第二层生成，可优化)
     *8.检查需要检查的语言项是否为数组
     */
    if (configOptions.jsonAndExcel) {
        if (!configOptions.jsonAndExcel.jsonPath || !configOptions.jsonAndExcel.excelPath || !configOptions.jsonAndExcel.defaultLang || !configOptions.jsonAndExcel.langToCheck) {
            throw new Error("jsonAndExcel中的jsonPath、excelPath、defaultLang、langToCheck属性必须配置");
        } else {

            if (!isFileExists(configOptions.jsonAndExcel.jsonPath) || !isFileExists(configOptions.jsonAndExcel.excelPath)) {
                throw new Error("jsonAndExcel路径配置有错误");
            }

            if (!isFileExists(configOptions.jsonAndExcel.excelPath)) {
                throw new Error("excel文件不存在");
            }

            if (typeof configOptions.jsonAndExcel.defaultLang != "string") {
                throw new Error("defaultLang配置错误");
            }

            if (!Array.isArray(configOptions.jsonAndExcel.langToCheck)) {
                throw new Error("langToCheck属性应该为数组");
            }

            if (!configOptions.jsonAndExcel.logPath) {
                console.info("jsonAndExcel没有配置错误日志路径，使用默认路径");
                configOptions.jsonAndExcel.logPath = "./errorLog";
            }
        }
        //判断错误日志文件夹是否存在，不存在则创建
        if (!isFileExists(configOptions.jsonAndExcel.logPath)) {
            console.info("错误日志文件夹不存在，创建......");
            fs.mkdirSync(configOptions.jsonAndExcel.logPath);
        }
    }
    /**
     * 如果配置了excel重复词条，则检查如下配置项
     *1.检查是否配置了excelPath选项，该选项用于定位excel文件的路径
     *2.检查是否配置了默认语言
     */
    if (configOptions.checkDuplicate) {
        if (!configOptions.checkDuplicate.excelPath) {
            throw new Error("checkDuplicate检查重复词条必须配置excelPath选项");
        }
        if (typeof configOptions.checkDuplicate.excelPath != "string") {
            throw new Error("excelpath 必须为路径");
        }
        if(!configOptions.checkDuplicate.defaultLang){
            throw new Error("checkDuplicate必须配置defaultLang选项");
        }

    }

    return configOptions;
}

/**
 * 检查文件是否存在
 * @param {*文件路径} filePath 
 */
function isFileExists(filePath) {
    return fs.existsSync(filePath);
}

function output(str) {
    console.log("");
    console.log(str);
    console.log("");
}

module.exports = translateCheck;