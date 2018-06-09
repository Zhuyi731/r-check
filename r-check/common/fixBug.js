const eslint = require("eslint/lib/cli");

function fix(cwd) {
    console.log(cwd);
    eslint.execute(["eslint", "--fix", "--quiet", cwd]);
}

module.exports = fix;