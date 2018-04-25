const path = require("path");
const fs = require("fs");

function initFile(name) {
    !name && (name = "r.config.js");
    
    //当当前目录不存在配置文件的时候才会生成，避免覆盖
    !fs.existsSync(path.join(process.cwd(), name)) && copy(path.join(__dirname, "r.config.js"), path.join(process.cwd(), name));

    //cp .eslintrc.js
    !fs.existsSync(path.join(process.cwd(),".eslintrc.js")) && copy(path.join(__dirname, "eslintrc.js"), path.join(process.cwd(),".eslintrc.js"));

}

function copy(src, dest) {
    console.log(src,dest);
    fs.writeFileSync(dest,fs.readFileSync(src));
}

module.exports = initFile;