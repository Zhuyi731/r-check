const fs = require("fs");
const path = require("path");
const glob = require("glob");
const jschardet = require("jschardet");
const Validator = require("../../baseClass/Validator");

class EncodeValidator extends Validator {
    constructor(options) {
        super();
        this.name = "Encode Validator";
        this.description = "检查可能存在的非UTF-8编码的文件";
        this.exclude = /\.(txt|png|jpg|gif|eot|svg|ttf|woff|xls|xlsx|doc|docx|md|ico|rar|bat)$/;
        this.exclude2 = /(goform|node_modules)/;
        this.options = options;
        this.errDatas = {
            errNum: 0,
            warnNum: 0,
            messages: []
        };
    }

    beforeCheck() {
        this.message("检查编码格式中");
    }

    afterCheck() {
        this.message("编码格式检查完毕");
    }

    //@override
    check() {
        this.fileList = glob.sync(this.options.cwd + "/!(node_modules|goform)/**/*.*");
        let fileBuffer,
            result,
            fileType,
            confidence;
        // console.log(this.fileList);
        //遍历文件检查编码    
        this.fileList.forEach(file => {
            if (this.exclude.test(file) || this.exclude2.test(file)) return;
            if (fs.lstatSync(file).isDirectory()) return;
            // try {
                fileBuffer = fs.readFileSync(file);
                result = jschardet.detect(fileBuffer);
                fileType = result.encoding;
                confidence = parseFloat(result.confidence * 100).toFixed(2) + "%";
                //转换成utf-8时出现乱码 则有可能为ANSI编码    
                if (fileBuffer.toString("utf8").indexOf('�') > -1) {
                    if (fileType == null || (fileType.toLowerCase() != "utf-8" && fileType.toLowerCase() != "ascii" && fileType.toLowerCase() != "windows-2312")) {
                        this.errDatas.errNum++;
                        this.errDatas.messages.push({
                            fileName: file.replace(/\//g, "\\").split(this.options.cwd)[1],
                            fileType: fileType,
                            confidence: confidence
                        })
                        console.log(`Encode check error,检测到文件${file}的编码格式为${fileType}。确信度：${confidence}  @tag:encode`);
                        console.log("造成这种原因可能是:");
                        console.log("1.编码格式不正确");
                        console.log("2.文件被压缩");
                        console.log("3.不正确的文件后缀");
                        console.log("4.其他");
                        console.log("如果是第一种情况，请用NotePad++手动修改文件的编码格式");
                    }
                }
            // } catch (e) {
            //     //如有错误则继续即可
            // };
        });
        return this.errDatas;
    }

}

module.exports = EncodeValidator;