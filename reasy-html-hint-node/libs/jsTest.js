/**
 * js的语法检查
 */
var fs = require("fs");

var path = require("path");

var rd = require("readline");

var util = require("./../common/utils");

var opt = require("./../common/checkConfig");

var jslint = require("jslint");
//检查出的错误数量
var errNum = 0;
//错误log目录
var errLogPath = opt.errorLogPath;

/**
 * @param {*js文件列表} jsList 
 * @param {*js检查选项} checkOptions 
 * @param {*回调函数} callback
 * @added by zy  17/12/16
 */
function jsTest(jsList, checkOptions, callback) {
    var jsPath = jsList[0];

    var rdl = require('readline').createInterface({
        "input": fs.createReadStream(jsPath) // 建立 按行读取 的文件流
    });

    var code = "";

    //缓存   每次取一行的数据
    rdl.on("line", function (data) {
        code = code + data + "\n";
    });

    rdl.on("close", function () {

        var LintStream = require('jslint').LintStream;
        
        l = new LintStream(checkOptions);
        // console.log(checkOptions);
        var fileName = jsPath, fileContents = code;
        l.write({ "file": fileName, "body": fileContents });

        l.on('data', function (chunk, encoding, callback) {
            // chunk is an object
            // chunk.file is whatever you supplied to write (see above)
            // assert.deepEqual(chunk.file, fileName);
            // console.log(chunk.file +"******************************");
            // console.log(chunk.linted.errors);

            // chunk.linted is an object holding the result from running JSLint
            // chunk.linted.ok is the boolean return code from JSLINT()
            // chunk.linted.errors is the array of errors, etc.
            // see JSLINT for the complete contents of the object
            //统计错误数量
            errNum += chunk.linted.errors.length;
            
            //没有存在log目录则创建log目录
            if (!fs.existsSync(errLogPath)) {
                fs.mkdirSync(errLogPath);
            }
            //写入错误信息
            fs.writeFileSync(errLogPath + "/" + "js-" + jsPath.split("\\").pop().split(".")[0] + "-errLog.txt", util.dealErrLog(chunk.linted.errors), "utf8", (err) => {
                if (err) throw err;
                console.log("写入log文件出现错误");
            });
        });

        //检查完一个文件后，将这个文件从文件列表删除
        jsList.splice(0, 1);
        if (jsList.length == 0) {//全部检查完成后调用回调函数
            callback.call(this, errNum);
        } else {//没有全部检查完成则检查下一个文件
            jsTest(jsList, checkOptions, callback);
        }

    });

}
module.exports = jsTest;