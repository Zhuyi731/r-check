/**
 * html的语法检查
 * 通过htmlhint这个插件来实现自定义的检查项
 */
const fs = require("fs");
const path = require("path");
const util = require("./../../common/utils");
const HTMLHint = require("../../custom-htmlhint/lib/htmlhint").HTMLHint;
const debug = require("../../common/debug");
/**
 * 
 * @param {*html文件列表} htmlList 
 * @param {检查选项} checkOptions 
 * @added by zy @17/12/16
 * @rewrite @18/3/30
 * 抛弃readline的方法来读取文件
 * 完全通过HTMLHint来实现自定义
 */
function htmlTest(htmlList, checkOptions, cliOptions) {
    let errLogPath = checkOptions.errorLogPath,
        htmlLogPath = path.join(errLogPath, "/html"),
        messages = [],
        result,
        code,
        errNum = 0,

        multifile = cliOptions.multifile;


        //如果错误日志文件路径不存在，则创建
        util.isLogExist(errLogPath, htmlLogPath);

    /**
     * 遍历所有文件,读取文件信息，然后注入HTMLHint中进行验证
     */
    htmlList.forEach(function (el) {
        //过滤goform和npm包里的不检查,exclude配置内的不检查
        if (/(node_modules|goform)/g.test(el) || (checkOptions.exclude && checkOptions.exclude.test(el))) {
            return;
        }
        debug("当前检测文件:" + el);

        code = fs.readFileSync(el, "utf-8");
        !multifile && messages.push("/****************" + el.split("/").pop() + "********************/\n");
        result = HTMLHint.verify(code, checkOptions.htmlCheckOptions);
        !multifile && messages.push(util.dealErrLog(result));
        !multifile && messages.push("/****************" + el.split("/").pop() + "********************/\n");

        errNum += result.length;

        if (multifile && result.length) {
            //写入错误日志
            fs.writeFileSync(htmlLogPath + "/" + el.split("/").pop().split(".")[0] + ".txt", util.dealErrLog(result), "utf8", (err) => {
                console.log("写入log文件出现错误");
                if (err) throw err;
            });
        }
    }, this);

    debug("multifile:", multifile);
    if (errNum && !multifile) {
        fs.writeFileSync(htmlLogPath + "/errorLog.txt", messages.join("\n"), "utf8", (err) => {
            console.log("写入log文件出现错误");
            if (err) throw err;
        });
    }

    return errNum;
}



module.exports = htmlTest;