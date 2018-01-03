/**
 * css的语法检查
 */
var fs = require("fs");

var path = require("path");

var rd = require("readline");

var util = require("./../common/utils");

var opt = require("./../common/checkConfig");

var csslint = require("csslint").CSSLint;
//检查出的错误数量
var errNum = 0;
//错误log目录
var errLogPath = opt.errorLogPath;

/**
 * @param {*css文件列表} cssList 
 * @param {*css检查选项} checkOptions 
 * @param {*回调函数} callback
 * @added by zy  17/12/16
 */
function cssTest(cssList, checkOptions, callback) {
    var cssPath = cssList[0];

    var rdl = require('readline').createInterface({
        input: fs.createReadStream(cssPath) // 建立 按行读取 的文件流
    });

    var code = "";

    //缓存   每次取一行的数据
    rdl.on("line", function (data) {
        code = code + data + "\n";
    });

    rdl.on("close", function () {
        var messages = csslint.verify(code, checkOptions);

        //csslint返回的值有些不同
        if (messages.messages.length > 0) {
            //统计错误数量
            errNum += messages.messages.length;

            //没有存在log目录则创建log目录
            if (!fs.existsSync(errLogPath)) {
                fs.mkdirSync(errLogPath);
            }
            //写入错误信息
            fs.writeFileSync(errLogPath + "/" + "css-" + cssPath.split("\\").pop().split(".")[0] + "-errLog.txt", util.dealErrLog(messages.messages), "utf8", (err) => {
                if (err) throw err;
                console.log("写入log文件出现错误")
            });
        }

        //检查完一个文件后，将这个文件从文件列表删除
        cssList.splice(0, 1);
        if (cssList.length == 0) {//全部检查完成后调用回调函数
            callback.call(this, errNum);
        } else {//没有全部检查完成则检查下一个文件
            cssTest(cssList, checkOptions, callback);
        }

    })

}
module.exports = cssTest;