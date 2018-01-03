/**
 * html的语法检查
 */
var fs = require("fs");

var path = require("path");

var rd = require("readline");

var util = require("./../common/utils");

var opt = require("./../common/checkConfig");

var HTMLHint = require("htmlhint").HTMLHint;
//检查出的错误数量
var errNum = 0;
//错误log目录
var errLogPath = opt.errorLogPath;

/**
 * 
 * @param {*html文件列表} htmlList 
 * @param {*html检查选项} checkOptions 
 * @param {*回调函数} callback
 * @added by zy  17/12/16
 */
function htmlTest(htmlList, checkOptions,callback) {

        var htmlPath = htmlList[0];
        var rdl = require('readline').createInterface({
            input: fs.createReadStream(htmlPath) // 建立 按行读取 的文件流
        });                                                
    
        var code = "";
    
        rdl.on("line", function (data) {
            code = code + data + "\n";
            // console.log(data);
        });
    
        rdl.on("close", function () {
            var messages = HTMLHint.verify(code, checkOptions);
            if (messages.length > 0) {
                //统计错误数量
                errNum += messages.length;
    
                //没有存在log目录则创建log目录
                if (!fs.existsSync(errLogPath)) {
                    fs.mkdirSync(errLogPath);
                }
                //写入错误信息
                fs.writeFileSync(errLogPath + "/" +"html-"+ htmlPath.split("\\").pop().split(".")[0] + "-errLog.txt", util.dealErrLog(messages), "utf8", (err) => {
                    if (err) throw err;
                    console.log("写入log文件出现错误")
                });
            }
    
            //检查完一个文件后，将这个文件从文件列表删除
            htmlList.splice(0,1);
            if(htmlList.length == 0){//全部检查完成后调用回调函数
                callback.call(this,errNum);
            }else{//没有全部检查完成则检查下一个文件
                htmlTest(htmlList, checkOptions,callback);
            }

        })

}
module.exports = htmlTest;