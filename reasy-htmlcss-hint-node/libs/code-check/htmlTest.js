/**
 * html的语法检查
 * 通过htmlhint这个插件来实现自定义的检查项
 */
const fs = require("fs");
const path = require("path");
const util = require("./../../common/utils");
const HTMLHint = require("../../custom-htmlhint/lib/htmlhint").HTMLHint;

/**
 * 
 * @param {*html文件列表} htmlList 
 * @param {检查选项} checkOptions 
 * @added by zy @17/12/16
 * @rewrite @18/3/30
 * 抛弃readline的方法来读取文件
 * 完全通过HTMLHint来实现自定义
 */
function htmlTest(htmlList, checkOptions) {
    let errLogPath = checkOptions.errorLogPath,
        htmlLogPath = path.join(errLogPath, "/html"),
        messages,
        code,
        errNum = 0,
        logExist = false;

    /**
     * 遍历所有文件,读取文件信息，然后注入HTMLHint中进行验证
     */
    htmlList.forEach(function (el) {
        //过滤goform和npm包里的
        if (el.indexOf("goform") > -1 || el.indexOf("node_modules") > -1) {
            return;
        }

        code = fs.readFileSync(el, "utf-8");
        messages = HTMLHint.verify(code, checkOptions.htmlCheckOptions);
        errNum += messages.length;
        //如果错误日志文件路径不存在，则创建
        if (!logExist) {
            if (!fs.existsSync(errLogPath)) {
                fs.mkdirSync(errLogPath);
            }
            //如果日志目录下html文件夹不存在
            if (!fs.existsSync(htmlLogPath)) {
                fs.mkdirSync(htmlLogPath);
            }
            logExist = true;
        }
        if (messages.length) {
            //写入错误日志
            fs.writeFileSync(htmlLogPath + "/" + el.split("/").pop().split(".")[0] + ".txt", util.dealErrLog(messages), "utf8", (err) => {
                console.log("写入log文件出现错误");
                if (err) throw err;
            });
        }
    }, this);

    return errNum;
}
module.exports = htmlTest;