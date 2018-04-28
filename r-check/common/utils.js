function RUtil() {
    var that = this;

    //log中需要过滤的信息key值
    // this.logFilter = {
    //     "link": "link",
    //     "col": "col",
    //     "url": "url",
    //     "init": "init"
    // };

    this.logFilter = ["link", "col", "url", "init", "fix", "severity", "column", "nodeType", "endLine", "endColumn"];


    //处理html css保存信息log
    this.dealErrLog = function (messages) {
        var logString = "";
        for (var i = 0; i < messages.length; i++) {
            logString += that.objToString(messages[i]);
        }
        return logString;
    };
    this.dealJsMessage = function (messages) {
        var prop,
            st = "";
        messages.forEach(function (msg) {
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
            } else { //迭代弄出信息
                if (that.logFilter.indexOf(prop) == -1) {
                    st += prop + ":{\n" + that.objToString(obj[prop]) + "}\n\n";
                }
            }
        }
        return st;
    }
}
Rutil = new RUtil();
module.exports = Rutil;