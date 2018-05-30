const fs = require("fs");
const path = require("path");
const glob = require("glob");
const htmlCheck = require("./htmlTest");
const cssCheck = require("./cssTest");
const jsCheck = require("./jsTest");
const debug = require("../../common/debug");

let htmlCheckOptions,
    cssCheckOptions,
    jsCheckOptions,
    checkOptions = require("../../common/checkConfig"),
    cliOptions;

let htmlList,
    cssList,
    jsList;

/**
 * export part
 * @rewrite by zy 
 * 异步检查变为同步检查
 * 精简部分代码
 */
function souceCode(fPath, options) {
    cliOptions = options;
    //检查配置项是否有误
    checkOptionsValid(fPath, options);

    //获取所有js、css、html文件路径
    getFileList(fPath);

    //检查html和css和js语法规范
    options.checkHtml && (checkHtml());
    options.checkCss && (checkCss());
    options.checkJs && (checkJs());

}


/**
 * 获取html、css、js等的路径
 * @param {*源代码目录路径} filePath 
 */
function getFileList(filePath) {
    htmlList = glob.sync("**/*.html");
    cssList = glob.sync("**/*.css");
}

/**
 * 检查配置项是否合法
 * @param {*当前运行的路径} fPath
 * @param {*选项} opt 
 */
function checkOptionsValid(fPath, opt) {
    if (opt.optionsPath && fs.existsSync(opt.optionsPath)) {
        let data = require(path.join(fPath, opt.optionsPath));

        if (opt.checkHtml && typeof data.htmlCheckOptions == "undefined") {
            throw new Error("配置文件缺少htmlCheckOptions配置项");
        }

        if (opt.checkCss && typeof data.cssCheckOptions == "undefined") {
            throw new Error("配置文件缺少cssCheckOptions配置项");
        }

        if (!data.errorLogPath) {
            console.info("配置文件缺少errorLogPath配置项,使用默认路径./errorLog作为日志路径");
            data.errorLogPath = "./errorLog";
        }

        checkOptions = data;

    } else {
        console.info("/******************使用默认配置********************/");
    }

    checkOptions.originPath = checkOptions.errorLogPath;
    checkOptions.errorLogPath = path.join(fPath, checkOptions.errorLogPath);

    htmlCheckOptions = checkOptions.htmlCheckOptions;
    cssCheckOptions = checkOptions.cssCheckOptions;
}

function checkJs() {
    message("开始JS检查");
    let res = jsCheck(checkOptions, cliOptions);
    messageWarn("JS",res.errorNum,"error");
    messageWarn("JS",res.warnNum,"warn");
    message("JS检查结束");
}

function checkCss() {
    message("开始CSS检查");
    let errors = cssCheck(cssList, checkOptions, cliOptions);
    messageWarn("CSS",errors,"error");
    message("CSS检查结束");
}

function checkHtml() {
    message("开始HTML检查");
    let errors = htmlCheck(htmlList, checkOptions, cliOptions);
    messageWarn("HTML",errors,"error");
    message("HTML检查结束");
}

function message(mes){
    console.log("");
    console.log("");
    console.log(`/***************${mes}********************/`);
    console.log("");
    console.log("");
}
function messageWarn(check,errors,type){
    let typeMap = {
        warn:"警告",
        error:"错误"
    };
    console.log("");
    
    if(errors){
        console.warn(`${check}检查共发现${errors}个${typeMap[type]} @tag:${check}`);
    }else{
        console.log(`${check}检查共发现${errors}个${typeMap[type]}  @tag:${check}`);
    }

    console.log("");
}


module.exports = souceCode;