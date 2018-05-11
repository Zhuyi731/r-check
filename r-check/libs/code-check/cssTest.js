/**
 * css的语法检查
 */
const fs = require("fs");
const path = require("path");
const util = require("./../../common/utils");
const csslint = require("../../custom-csslint/dist/csslint");
const debug = require("../../common/debug");

/**
 * @param {*css文件列表} cssList 
 * @param {*css检查选项} checkOptions 
 * @param {*回调函数} callback
 * @added by zy  17/12/16
 * @rewrite @18/3/20
 */
function cssTest(cssList, checkOptions, cliOptions) {
    let errLogPath = checkOptions.errorLogPath,
        cssLogPath = path.join(errLogPath, "/css"),
        messages = [],
        result,
        code,
        errNum = 0,
        multifile = cliOptions.multifile;

    cssList.forEach(function (el) {
        //过滤goform和npm包里的不检查,exclude配置内的不检查
        if (/(node_modules|goform)/g.test(el) || (checkOptions.exclude && checkOptions.exclude.test(el))) {
            return;
        }
        debug("当前检查文件:", el);
        code = fs.readFileSync(el, "utf-8");

        !multifile && messages.push("/****************" + el.split("/").pop() + "********************/\n");
        result = csslint.verify(code, checkOptions.cssCheckOptions).messages;
        !multifile && messages.push(util.dealErrLog(result));
        !multifile && messages.push("/****************" + el.split("/").pop() + "********************/\n");

        errNum += result.length;

        //如果错误日志文件路径不存在，则创建
        util.isLogExist(errLogPath, cssLogPath);

        if (multifile && result.length) {
            //写入错误日志
            fs.writeFileSync(cssLogPath + "/" + el.split("/").pop().split(".")[0] + ".txt", util.dealErrLog(result), "utf8", (err) => {
                console.log("写入log文件出现错误");
                if (err) throw err;
            });
        }

    }, this);

    debug("multifile:", multifile);
    //如果配置的是单个文件的话
    if (errNum && !multifile) {
        fs.writeFileSync(cssLogPath + "/errorLog.txt", messages.join("\n"), "utf8", (err) => {
            console.log("写入log文件出现错误");
            if (err) throw err;
        });
    }

    return errNum;
}


module.exports = cssTest;