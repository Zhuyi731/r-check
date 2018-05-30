const jschardet = require("jschardet");
const fs = require("fs");
const glob = require("glob");
const path = require("path");

function checkEncode(fPath, options) {
    console.log(" ");
    console.log("/************开始文件编码格式检查************/")
    console.log(" ");
    let fileList = glob.sync(fPath + "/!(node_modules|goform)/**/*.*");
    let errorDatas = 0;

    const rConfig = require(path.join(fPath, options.optionsPath));

    //过滤nodemodules和goform
    fileList = filterFiles(fileList, rConfig);

    //遍历文件检查编码    
    fileList.forEach((file) => {
        let data = fs.readFileSync(file),
            result = jschardet.detect(data),
            fileType = result.encoding,
            confidence = parseFloat(result.confidence * 100).toFixed(2) + "%";
            
        //转换成utf-8时出现乱码 则有可能为ANSI编码    
        if (data.toString("utf8").indexOf('�') > -1) {
            if (fileType == null || (fileType.toLowerCase() != "utf-8" && fileType.toLowerCase() != "ascii" && fileType.toLowerCase() != "windows-2312")) {
                errorDatas++;
                console.warn(`检测到文件${file}的编码格式为${fileType}。确信度：${confidence}  @tag:encode`);
                console.log("造成这种原因可能是:");
                console.log("1.编码格式不正确");
                console.log("2.文件被压缩");
                console.log("3.不正确的文件后缀");
                console.log("4.其他");
                console.log("如果是第一种情况，请用NotePad++手动修改文件的编码格式");
            }
        }
    });

    if (!errorDatas) console.log("没有发现文件编码错误");

    console.log(" ");
    console.log("/************文件编码格式检查结束************/")
    console.log(" ");
}

function filterFiles(fList, rConfig) {
    if (!rConfig.exclude) {
        rConfig.exclude = /(node_modules|goform)/g;
    }
    let testReg = rConfig.exclude;
    let testReg2 = /\.(txt|png|jpg|gif|eot|svg|ttf|woff|xlsx|doc|md)$/
    for (let i = 0; i < fList.length; i++) {
        if (testReg.test(fList[i]) || testReg2.test(fList[i])) {
            fList.splice(i, 1);
            i--;
        }
    }
    return fList;
}

/*for debug */
// checkEncode(process.cwd() + "/reasy-htmlcss-hint-node")
// let fd = fs.readFileSync("test.txt");
// console.log(jschardet.detect(fd));


module.exports = checkEncode;