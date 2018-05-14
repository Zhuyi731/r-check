const path = require("path");
const fs = require("fs");

function initFile(name, type, force) {

    name = typeof name == "string" ? name : "r.config.js";

    if (type == "all") {
        //当当前目录不存在配置文件的时候才会生成，避免覆盖
        if (!!force) {
            copy(path.join(__dirname, "rconfig.js"), path.join(process.cwd(), name));
        } else {
            if (fs.existsSync(path.join(process.cwd(), name))) {
                console.info("检测到r.config.js文件已经存在，如果要生成新的配置文件，请使用r-check init --force来生成。或者删除原有文件");
            } else {
                copy(path.join(__dirname, "rconfig.js"), path.join(process.cwd(), name));
            }
        }
    }
    if (!!force) {
        //cp .eslintrc.js
        copy(path.join(__dirname, "eslintrc.js"), path.join(process.cwd(), ".eslintrc.js"));
        //cp .eslintignore
        copy(path.join(__dirname, "eslintignore"), path.join(process.cwd(), ".eslintignore"));
    } else {
        if (fs.existsSync(path.join(process.cwd(), ".eslintrc.js")) || fs.existsSync(path.join(process.cwd(), ".eslintignore"))) {
            console.info("检测到.eslintrc或.eslintignore文件已经存在，如果要生成新的配置文件，请使用r-check init --force来生成。或者删除原有文件");
        } else {
            //cp .eslintrc.js
            copy(path.join(__dirname, "eslintrc.js"), path.join(process.cwd(), ".eslintrc.js"));
            //cp .eslintignore
            copy(path.join(__dirname, "eslintignore"), path.join(process.cwd(), ".eslintignore"));
        }

    }
}

//文件复制，大文件建议使用stream
function copy(src, dest) {
    fs.writeFileSync(dest, fs.readFileSync(src));
}

module.exports = initFile;