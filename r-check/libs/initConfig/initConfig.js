const path = require("path");
const fs = require("fs");
let argsMap = {
    "all": "生成全部配置文件",
    "eslint": "仅生成ESLint相关配置文件",
    "rconfig": "仅生成r.config.js"
};

function initFile(options, cwd, exist) {
    console.log("");
    console.log("/****************************生成配置文件中*****************************/")
    console.log("");
    console.log(`参数:${argsMap[options.fileType]}`);
    console.log("是否覆盖:" + options.force);
    console.log("是否为老代码:" + options.isOld);
    console.log("");
    console.log("");

    switch (options.fileType) {
        case "all":
            {
                //只有不强制生成并且 三个文件中有存在的情况下才不生成
                if (!options.force) {
                    if (!exist.eslintrc) {
                        !options.isOld ? copy(path.join(__dirname, "eslintrc.js"), path.join(cwd, ".eslintrc.js")) :
                            copy(path.join(__dirname, "eslintrc-old.js"), path.join(cwd, ".eslintrc.js"));
                    }

                    !exist.eslintignore && copy(path.join(__dirname, "eslintignore"), path.join(cwd, ".eslintignore"));
                    !exist.rconfigjs && copy(path.join(__dirname, "rconfig.js"), path.join(cwd, "r.config.js"));
                } else {
                    !options.isOld ? copy(path.join(__dirname, "eslintrc.js"), path.join(cwd, ".eslintrc.js")) :
                        copy(path.join(__dirname, "eslintrc-old.js"), path.join(cwd, ".eslintrc.js"));
                    copy(path.join(__dirname, "eslintignore"), path.join(cwd, ".eslintignore"));
                    copy(path.join(__dirname, "rconfig.js"), path.join(cwd, "r.config.js"));
                }
            }
            break;
        case "eslint":
            {
                if (!options.force) {
                    if (!exist.eslintrc) {
                        !options.isOld ? copy(path.join(__dirname, "eslintrc.js"), path.join(cwd, ".eslintrc.js")) :
                            copy(path.join(__dirname, "eslintrc-old.js"), path.join(cwd, ".eslintrc.js"));
                    }

                    !exist.eslintignore && copy(path.join(__dirname, "eslintignore"), path.join(cwd, ".eslintignore"));
                } else {
                    !options.isOld ? copy(path.join(__dirname, "eslintrc.js"), path.join(cwd, ".eslintrc.js")) :
                        copy(path.join(__dirname, "eslintrc-old.js"), path.join(cwd, ".eslintrc.js"));
                    copy(path.join(__dirname, "eslintignore"), path.join(cwd, ".eslintignore"));
                }
            }
            break;
        case "rconfig":
            {
                if (!options.force) {
                    !exist.rconfigjs && copy(path.join(__dirname, "rconfig.js"), path.join(cwd, "r.config.js"));
                } else {
                    copy(path.join(__dirname, "rconfig.js"), path.join(cwd, "r.config.js"));
                }
            };
    }

    setTimeout(() => {
        console.log("/****************************生成配置文件生成完毕*****************************/")
    }, 500);
}

//文件复制，大文件建议使用stream
//不能使用fs.copyfile   考虑兼容低版本
function copy(src, dest) {
    fs.writeFileSync(dest, fs.readFileSync(src));
}

module.exports = initFile;