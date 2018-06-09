const eslint = require("eslint/lib/cli");
const fs = require("fs");

function fix(cwd) {
    console.log(`修复路径${cwd}`);
    eslint.execute(["eslint", cwd, "--fix", "-o", `${__dirname}/errorLog.json`, "-f", "json", ".js", "./"]);
    fs.existsSync(`${__dirname}/errorLog.json`) && fs.unlinkSync(`${__dirname}/errorLog.json`);
    console.log("BUG修复成功");
}

module.exports = fix;