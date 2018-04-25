var excel = require('xlsx');
var fs = require('fs');
var path = require('path');
var file = require('./file');
var help = require('./help');

//文件写入
function writeObjSync(filepath, obj) {
    file.createFolder(path.dirname(filepath));
    fs.writeFileSync(filepath, JSON.stringify(obj, null, 4));
}

function readJsonFile(langArr, jsonpath){
    let langObj = {};
        for(let m = 0, n = langArr.length; m < n; m++){
            let folderName = langArr[m], filepath = path.join(jsonpath, folderName);
            fs.readdirSync(filepath).forEach(function(file){
                if(path.extname(file) === ".json"){
                    langObj[folderName] = JSON.parse(fs.readFileSync(path.join(filepath, file), "utf-8"));
                    return;
                }
            });
        }
    return langObj;
}

function parse(file, dest, key, langArr, type, jsonpath) {
    var wb = excel.readFileSync(file, {
        cellFormula: false
    });
    
    var sheet_name_list = wb.SheetNames;
    sheet_name_list.forEach(function(y) { /* 遍历sheets */
        //ws数据格式：[{en:"xx",cn:"xx",zh:"xx"},{en:"xx",cn:"xx",zh:"xx"},{en:"xx",cn:"xx",zh:"xx"}]
        var ws = excel.utils.sheet_to_json(wb.Sheets[y]);
        //遍历多国语内容
        // langObj:{cn:{"xxx":"xxx"}, zh:{},es:{}}
        var langObj = {},
            curRow = "", //当前行数据
            curPage = "",//当前页面
            keyValue = "",//当前key列对应的值
            repeatItem = {},//记录重复key值信息
            repeatKeys = {},//重复字段信息
            curRepeat = null;

        if(type == 3){
            let repeatPath = path.join(jsonpath, "repeat", "keys.json");
            if(fs.existsSync(repeatPath)){
                repeatKeys = JSON.parse(fs.readFileSync(repeatPath, "utf-8"));
            }
        }

        //读取源语言包中的语言信息
        if(type != 1){
            langObj = readJsonFile(langArr, jsonpath);
        }
        
        for (var row = 0, rlen = ws.length; row < rlen; row++) { //遍历表格行

            if (!ws[row][key]) {
                console.warn('[WARN]:not find key `' + ws[row][key] + '` in excel!\r\n');
            }

            curRow = ws[row];
            keyValue = curRow[key]; 
            if (!langArr || langArr.length === 0) {//如果没有指定需要输出的语言,则
                for (var col in curRow) { //遍历表格列,curRow表示一行的内容, col表示列头
                    if(curRow.hasOwnProperty(col)){
                        langArr.push(col);
                    }
                }
                //读取源语言包中的语言信息
                if(type != 1){
                    langObj = readJsonFile(langArr, jsonpath);
                }
            }

            curRepeat = repeatKeys[keyValue] || [];
            curRepeat = curRepeat.concat();// 数组复制，解除与原引用的关联
            let repeatKey = {};
            //否则遍历语言
            for (let i = 0, l = langArr.length; i < l; i++) { //遍历表格列,ws[row]表示一行的内容, col表示列头
                let col = langArr[i], colVal = curRow[col];

                if (col === key) {
                    continue;
                }

                //否则进行查重匹配工作
                if (!(col in langObj)) {
                    langObj[col] = {};
                }

                //语言优化直接替换
                if(type == 2){
                    langObj[col][keyValue] = colVal;
                    continue;
                }
                
                //检测到当前分页信息,若以\*-开头则表示为页面信息，并不知道分页信息会写在哪个列上，因此需要轮训每个列
                if(!keyValue){
                    keyValue = colVal;
                    if(keyValue && (new RegExp("^/\\*\-")).test(keyValue)){
                        curPage = keyValue;
                        langObj[col][keyValue] = keyValue;
                        break;
                    }
                    continue;
                }else if((new RegExp("^/\\*\-")).test(keyValue)){
                    curPage = keyValue;
                    langObj[col][keyValue] = keyValue;
                    break;
                }
                //分页信息监测结束    ---end
                
                let val = langObj[col][keyValue];
                if(val === undefined){
                    langObj[col][keyValue] = colVal;
                }else{
                    //判断原语言项中已经存在该翻译项
                    //同时检查该key重新编码后的字段是否与当前的值重复
                    if(val === colVal){
                        repeatKey[col] = true;
                    }
                    if(curRepeat.length > 0){
                        let tempKeys = [];
                        while(curRepeat.length > 0){
                            let itemKey = curRepeat.shift(),  
                                innerVal = langObj[col][itemKey];
                            if(innerVal === colVal){
                                repeatKey[col] || (keyValue = itemKey);
                                repeatKey[col] && tempKeys.push(itemKey);
                                repeatKey[col] = true;
                            }
                        }
                        curRepeat = tempKeys;
                    }

                    if(!repeatKey[col]){//key相同，对应的value不同
                        //判断当前key值是否重复，如重复则重新编码直到不存在重复key值为止
                        let oldKey = keyValue;
                        while(langObj[col][keyValue]){
                            repeatItem[curPage] || (repeatItem[curPage] = {});
                            keyValue = help.formatKey(keyValue);
                        }
                        //记录
                        repeatItem[curPage][keyValue] = oldKey;
                        repeatKeys[oldKey] ? repeatKeys[oldKey].push(keyValue) : (repeatKeys[oldKey] = [keyValue]);

                        //对于其它语言项中的原字符进行重新编码
                        for(let b = 0; b < i; b++){
                            let curLang = langArr[b];
                            if(!repeatKey[curLang]){
                                delete langObj[curLang][oldKey];
                            }
                            langObj[curLang][keyValue] = curRow[curLang];
                        }
                        langObj[col][keyValue] = colVal;
                    }
                }
            }
        }
        
        for (let lang in langObj) {
            writeObjSync(dest + '/' + lang + '/' + 'lang.json', langObj[lang]);
        }
        //打印重复项相关信息
        if(!isEmptyObject(repeatKeys)){
            writeObjSync(path.join(dest, 'REPEAT/keys.json'), repeatKeys);
            // writeObjSync(path.join(jsonpath, 'REPEAT/keys.json'), repeatKeys);
            writeObjSync(path.join(dest, 'REPEAT/log.json'),  repeatItem);
        }
        //测试程序
        // let t = repeatKeys()
        // for()
         
    });
}

function isEmptyObject(e) {  
    let t;  
    for (t in e)  
        return !1;  
    return !0  
}  

/**
 * @param {*} settings {
 *    file: "", excel文件,完整路径包括文件名
 *    dest: "", 目标文件路径
 *    key: "", 语言key值
 *    defaultLang: "",默认语言
 *    lang: 提取语言项,
 *    type: 操作类型，1: 首次导入，2：语言包优化，3：新增语言项
 *    json: 各语言包文件对应的根目录，该目录下面为每个语言对应的文件夹
 * }
 */
exports.parse = function(settings) {

    if (!settings) {
        throw new Error('settings can`t be empty!');
    }

    if (!settings.file) {
        throw new Error('please set “settings.file!”');
    }

    settings.dest = settings.dest || path.dirname(settings.file);
    settings.key = settings.key || settings.defaultLang || 'en';

    if (!(settings.lang && settings.lang instanceof Array && settings.lang.length > 0)) {
        settings.lang = false;
    }

    file.createFolder(settings.dest);
    parse(settings.file, settings.dest, settings.key, settings.lang, settings.type, settings.json);
};
