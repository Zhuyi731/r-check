const eslint = require("eslint/lib/cli");
const path = require("path");
const fs = require("fs");
const util = require("../../common/utils");
const cwd = process.cwd();
const c = cwd.split("\\").pop();
const debug = require("../../common/debug");

function test(opt, cliOptions) {
    let args,
        json,
        messages = [],
        result,
        errorNum = 0,
        warnNum = 0,
        res,
        logPath = opt.originPath,
        multifile = cliOptions.multifile,
        filename;


    //检查错误日志文件夹是否存在，若不存在则创建
    util.isLogExist(path.join(cwd, logPath), path.join(cwd, logPath, "/js"));

    // debug(cwd, logPath);
    args = ["eslint", cwd, "-o", `${logPath}/js/errorLog.json`, "-f", "json", "./"];
    eslint.execute(args);

    json = fs.readFileSync(path.join(cwd, `${logPath}/js/errorLog.json`));
    json = JSON.parse(json);
    messages = json.messages;
    //  debug(json);
    //如果是多文件的话就将index.json中的信息提取到不同的文件中去
    json.forEach(function (error) {
        errorNum += error.errorCount;
        warnNum += error.warningCount;
        let file = error.filePath.split("\\").pop().split(".")[0];
        //当需要写入到多个文件时,用writeFileSync
        if (!!multifile) {
            filename = path.join(cwd, logPath, "/js/", file) + ".txt";
            fs.writeFileSync(filename, util.dealJsMessage(error.messages), "utf8", (err) => {
                console.log(`写入log文件${filename}出现错误`);
                if (err) throw err;
            });
        } else {
            //写入到一个文件时用append
            filename = path.join(cwd, logPath, "/js/errorLog.txt");
            // util.creatEmptyFile(filename);
            fs.appendFileSync(filename, util.dealJsMessage(error.messages, file), "utf-8", (err) => {
                console.log(`写入log文件${filename}出现错误`, err);
                if (err) throw err;
            });
        }
    }, this);

    //删除index.json文件 多文件的话
    fs.unlinkSync(path.join(cwd, `${logPath}/js/errorLog.json`));

    return {
        "errorNum": errorNum,
        "warnNum": warnNum
    };
}

module.exports = test;