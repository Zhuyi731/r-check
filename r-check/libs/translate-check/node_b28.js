var jsdom = require('jsdom'),
    fs = require('fs'),
    path = require('path'),
    B = require('./utils/b28lib').b28lib,
    glob = require('./utils/glob'),
    file = require('./utils/file'),
    xlsxWriter = require('./utils/xlsx-write'),
    console = require('./utils/console'),
    nodeGlob = require("glob");

var includes = '**.{js,html,htm,asp,tpl,gch}';
var excludes = '**{lang,img,.css,.svn,.git,jquery,.min.js,shiv.js,respond.js,b28,shim.js,/goform/,/cgi-bin/}**';
//或['.svn', 'goform', 'css', 'images', 'lang', 'fis', 'config.js', 'release.js'];


var spliter = '\t**--**\t';

var gfileList = [],

    CONFIG = {
        src: null,
        dest: null,
        help: null,
        onlyZH: false,
        dict: null //翻译模式时需要指定
    },
    jsonDict = {};


function unique(inputs, type) {
    var res = [];
    var json = {};
    if (!inputs) {
        return [];
    }
    for (var i = 0; i < inputs.length; i++) {
        if (typeof inputs[i] === 'undefined') continue;

        if (!json[inputs[i]]) {
            if (type === 1) {
                inputs[i] = inputs[i].split(spliter);
            }
            res.push(inputs[i]);
            //json[inputs[i]] = 1;
        }
    }
    return res;
}


function readDict(filename, key, value) { //读取字典
    if (path.extname(filename) === '.xlsx') {
        jsonDict.content = require('./utils/xlsx-read').parse(filename, key, value);
    } else {
        jsonDict.content = fs.readFileSync(filename, 'utf-8');
    }

}

function writeExcel(filename, array) { //以xlsx形式写入
    xlsxWriter.write(filename, 'translate', array, {
        wscols: [{
            wch: 30
        }, {
            wch: 10
        }, {
            wch: 0.0000000000001
        }, {
            wch: 100
        }]
    });
    // console.log(filename + ' success saved!');
}

function writeText(filename, content) { //以文本形式写入
    fs.writeFileSync(filename, content);
    // console.log(filename + ' success saved!');
}

function writeFile(saveTo, array) { //文件写入
    saveTo = path.resolve(saveTo);
    if (/\.xlsx$/.test(saveTo)) {
        writeExcel(saveTo, unique(array, 1));
    } else {
        writeText(saveTo, unique(array, 1).join("\r\n"));
    }
}

//输出完整路径
function correctPath(_path) {
    if (!_path) return '';
    return path.resolve(_path);
}

function filter(key) {
    if (typeof includes === 'string') {
        includes = glob(includes);
        excludes = glob(excludes);
    }

    return includes.test(key) && !excludes.test(key);
}

//提取文件，并且拷贝不需要操作的文件
function getFileList(srcFolder, destFolder) {
    if (!gfileList || gfileList.length === 0) {
        srcFolder = correctPath(srcFolder);

        var files = file.scanFolder(srcFolder);

        if (destFolder) {
            destFolder = correctPath(destFolder);

            files.folders.forEach(function (val) {
                file.createFolder(path.join(destFolder, path.relative(srcFolder, val))); //创建目录
            });

        }

        files.files.forEach(function (val) {
            //console.log("file.relative(CONFIG.src, val)========="+file.relative(CONFIG.src, val));
            //console.log("destFolder========="+destFolder);
            if (filter('/' + file.relative(CONFIG.src, val))) {
                gfileList.push({
                    fileName: val,
                    fileType: path.extname(val)
                });

            } else if (destFolder) {

                //如果是翻译模式需要将未匹配的文件原样拷贝
                var dst = path.join(destFolder, path.relative(srcFolder, val));
                if (fs.existsSync(val) && !fs.existsSync(dst)) {
                    file.cp(val, dst);
                }
            }
        });
    }

    return gfileList;
}

//提取html
function _getPageLangData(page) {
    //console.log("path.resolve(page)+++++++"+path.resolve(page));
    var content = fs.readFileSync(page, 'utf-8');
    var document = new jsdom.JSDOM(content).window.document;
    var arr = new B.getPageData(document.documentElement, CONFIG.onlyZH, path.resolve(page));
    document = '';
    //console.log("arr+++++++"+arr);
    return arr;
}

//提取js
function _getResLangData(file) {
    var content = fs.readFileSync(file, 'utf-8');
    var arr = new B.getResData(content, CONFIG.onlyZH, path.resolve(file));
    return arr;
}

//执行文件提取
function doGetLangData(file) {
    if (file.fileType == ".js") {
        return _getResLangData(file.fileName);
    } else {
        return _getPageLangData(file.fileName);
    }
}

function checkTranslate(srcdir, transFile, saveTo, fileName) {
    let errorData = [];
    CONFIG.src = srcdir;
    CONFIG.dict = transFile;

    var langFetchArr = [];
    //srcdir为文件夹
    if (srcdir && typeof srcdir == 'string' && fs.lstatSync(srcdir).isDirectory()) {
        gfileList = getFileList(srcdir);
        gfileList.forEach(function (val) {
            //console.log("文件为++++++++++++++++"+val.fileName);
            langFetchArr = langFetchArr.concat(doGetLangData(val));
            //console.log("内容++++++++++++++++"+langFetchArr);
        });

    } else {
        langFetchArr = doGetLangData({
            fileName: srcdir,
            fileType: path.extname(srcdir)
        });
    }

    let files = nodeGlob.sync(transFile + "/**/*.json")
   
    files.forEach((file) => {
        let transData = fs.readFileSync(file, "utf-8");
        errorData.push(`/********${file}********/`);
        transData = JSON.parse(transData);

        for (let i = 0, l = langFetchArr.length; i < l; i++) {
            let curItem = langFetchArr[i];

            if (curItem && (new RegExp("^/\\*\-")).test(curItem)) {
                errorData.push(curItem);
            } else {
                if (transData[curItem] === undefined) {
                    errorData.push(curItem);
                }
            }
            if (i == l - 1) {
                errorData.push(`/********${file}********/`);
            }
        }
    })

    writeFile(path.join(saveTo, fileName), errorData);
    console.log(`文件检查已完成，错误信息文件为: ${fileName}`);

}

function _translatePage(page, saveTo) { //翻译html
    var content = fs.readFileSync(page, 'utf-8');
    var document = new jsdom.JSDOM(content).window.document;
    B.transTitle(document, path.resolve(page));
    B.translatePage(document, path.resolve(page));

    writeText(saveTo, "<!DOCTYPE html>\r\n" + document.documentElement.outerHTML);
}

function _translateRes(file, saveTo) { //翻译js
    var content = fs.readFileSync(file, 'utf-8');
    var ret = B.translateRes(content, path.resolve(file));
    writeText(saveTo, ret);
}

function doTranslate(file, savepath) { //执行翻译
    if (file.fileType == ".js") {
        _translateRes(file.fileName, savepath);
    } else if (file.fileType == ".htm" || file.fileType == ".html" || file.fileType == ".asp" || file.fileType == ".gch") {
        _translatePage(file.fileName, savepath);
    }
}

function translatePage(srcdir, saveTo) { //翻译入口
    if (srcdir && typeof srcdir == 'string' && fs.statSync(srcdir).isDirectory()) { //如果是目录,先扫描目录

        var fileList = getFileList(srcdir, saveTo);

        fileList.forEach(function (val) {
            doTranslate(val, val.fileName.replace(srcdir, saveTo));
        });
    } else {
        doTranslate({
            fileType: path.extname(srcdir),
            fileName: srcdir
        }, saveTo);
    }
    var jsonData = [],
        MSGCopy = B.getUnTranslate(); //获取未被翻译的项

    for (var key in MSGCopy) {
        jsonData.push([key, MSGCopy[key]]);
    }
    xlsxWriter.write('未翻译项.xlsx', 'xixi', jsonData);
    writeExcel(path.join(path.dirname(CONFIG.lang), 'remark.xlsx'), unique(B.getRemark(), 1));
}

CONFIG.help = '帮助信息:\r\n\t\r\n\t提取命令:\r\n\tnode node_b28.js -src=srcdir -dest=destdir -zh\r\n\t\r\n\t' + '翻译命令:\r\n\tnode node_b28.js -src=srcdir -dest=destdir -lang=langfile -t\r\n\t\r\n\t' + '如果语言包是excel，则命令如下：\r\n\ttnode node_b28.js -src=srcdir -dest=destdir -lang=langfile -t -key=en -value=fr';

module.exports = checkTranslate;