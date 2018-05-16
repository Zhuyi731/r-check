const fs = require("fs");
const path = require("path");

function RUtil() {
    var that = this;
    this.logFilter = ["link", "col", "url", "init", "fix", "severity", "column", "nodeType", "endLine", "endColumn"];
    that.logExist = [];

    //处理html css保存信息log
    this.dealErrLog = function (messages) {
        var logString = "";
        for (var i = 0; i < messages.length; i++) {
            if (typeof messages[i] === "object") {
                logString += that.objToString(messages[i]);
            } else {
                logString += messages[i] + "\n\n";
            }
        }
        return logString;
    };

    this.dealJsMessage = function (messages) {
        let jsErrNum = 0;
        var prop,
            st = "";
        messages.forEach(function (msg) {
            st += "No." + ++jsErrNum;
            st += that.objToString(msg) + "\n\n";
        }, this);
        return st;
    };

    //对象转字符串 加换行符分隔
    this.objToString = function (obj) {
        var st = "",
            prop;
        for (prop in obj) {
            if (typeof obj[prop] != "object") {
                //过滤一些没有必要的信息
                if (that.logFilter.indexOf(prop) == -1) {
                    st += prop + ":" + obj[prop] + "\n";
                }
            } else { 
                //迭代弄出信息
                if (that.logFilter.indexOf(prop) == -1) {
                    st += prop + ":{\n" + that.objToString(obj[prop]) + "}\n\n";
                }
            }
        }
        return st;
    };

    this.isLogExist = function () {
        let args = [].slice.call(arguments);
        //遍历参数，判断文件夹是否存在，不存在则创建之
        args.forEach((dir) => {
            if (!that.logExist[dir] && !fs.existsSync(dir)) {
                fs.mkdirSync(dir);
                that.logExist[dir] = true;
            } else {
                that.cleanFolder(dir);
            }
        });
    };
    
    this.cleanFolder = function (dir, reg) {
        let files = fs.readdirSync(dir),
            expression = reg || /\.txt$/;

        //遍历文件夹下文件，删除.txt文件
        files.forEach((file) => {
            expression.test(file) && fs.unlinkSync(path.join(dir, file));
        })
    };
    
    this.creatEmptyFile = function (filePath) {
        fs.writeFileSync(filePath, "", "utf-8");
    };
}
module.exports = new RUtil();