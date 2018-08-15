const fs = require("fs");
const path = require("path");

class Compiler {
    constructor() {
        this.cwd = process.cwd();
    }

    //编译当前文件目录
    compile(){
        if(!fs.existsSync(path.resolve("oem.config.js"))){
            throw Error("没有找到oem.config.js文件");
        }

        let config = require(path.resolve("oem.config.js"));
        


    }


}

module.exports = new Compiler();