/**
 * css的语法检查
 */
const fs = require("fs");
const path = require("path");
const util = require("./../common/utils");
const csslint = require("../custom-csslint/dist/csslint");
var errNum = 0;

/**
 * @param {*css文件列表} cssList 
 * @param {*css检查选项} checkOptions 
 * @param {*回调函数} callback
 * @added by zy  17/12/16
 * @rewrite @18/3/20
 */
function cssTest(cssList, checkOptions) {
    let errLogPath = checkOptions.errorLogPath,
        cssLogPath = path.join(errLogPath, "/css"),
        messages,
        code,
        errNum = 0,
        logExist = false;

    cssList.forEach(function (el) {

        if (el.indexOf("goform") > -1 || el.indexOf("node_modules") > -1) {
            return;
        }

        code = fs.readFileSync(el, "utf-8");
        messages = csslint.verify(code, checkOptions.cssCheckOptions).messages;
        errNum += messages.length;

        //如果错误日志文件路径不存在，则创建
        if (!logExist) {
            if (!fs.existsSync(errLogPath)) {
                fs.mkdirSync(errLogPath);
            }
            //如果日志目录下html文件夹不存在
            if (!fs.existsSync(cssLogPath)) {
                fs.mkdirSync(cssLogPath);
            }
            logExist = true;
        }

        if (errNum) {
            //写入错误日志
            fs.writeFileSync(cssLogPath + "/" + el.split("/").pop().split(".")[0] + ".txt", util.dealErrLog(messages), "utf8", (err) => {
                if (err) throw err;
                console.log("写入log文件出现错误");
            });
        }

    }, this);

    return errNum;
}


module.exports = cssTest;