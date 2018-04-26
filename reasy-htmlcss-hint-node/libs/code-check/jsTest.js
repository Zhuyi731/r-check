const eslint = require("eslint/lib/cli");
const path = require("path");
const fs = require("fs");
const util = require("../../common/utils");
const cwd = process.cwd();
const c = cwd.split("\\").pop();


function test(logPath) {
    let args,
        json,
        messages,
        errorNum = 0,
        warnNum = 0;

    if (!fs.existsSync(path.join(cwd, logPath))) {
        fs.mkdirSync(path.join(cwd, logPath));
    }

    if (!fs.existsSync(path.join(cwd, logPath, "/js"))) {
        fs.mkdirSync(path.join(cwd, logPath, "/js"));
    }

    args = ["eslint", cwd, "-o", `${logPath}/js/index.json`, "-f", "json", "./test"];
    eslint.execute(args);

    json = fs.readFileSync(path.join(cwd, `${logPath}/js/index.json`));
    json = JSON.parse(json);
    messages = json.messages;

    json.forEach(function (error) {
        errorNum += error.errorCount;
        warnNum += error.warningCount;

        fs.writeFileSync(path.join(cwd, logPath, "/js/", error.filePath.split("\\").pop().split(".")[0]) + ".txt", util.dealJsMessage(error.messages), "utf8", (err) => {
            console.log("写入log文件出现错误");
            if (err) throw err;
        });

    }, this);

    //删除index.json文件
    fs.unlinkSync(path.join(cwd, `${logPath}/js/index.json`));

}
test("./errorLog");

module.exports = test;