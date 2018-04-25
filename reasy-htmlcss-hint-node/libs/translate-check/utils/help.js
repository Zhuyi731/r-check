/**
 * 合并json文件
 * 策略
 * 若是语言优化则直接进行语言项覆盖操作
 * 若是新增语言则进行合并，且重复项key值一样value不同则进行重新编码
 */
var fs = require('fs');

const ACTIONTYPE = {
    NEW:1, //首次导入语言包
    UPDATE:2, //优化语言包
    ADDKEYS:3 //新增语言项
};

 //加上八位特殊编码
function formatKey(key){
    let arr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
    code = "{0}#{1}{2}{3}#", l = arr.length;
    
    key = decodeKey(key);
    return code.replace(/\{0\}/g, arr[Math.floor(Math.random()*l)]).replace(/\{1\}/g, arr[Math.floor(Math.random()*l)]).replace(/\{2\}/g, arr[Math.floor(Math.random()*l)]).replace(/\{3\}/g, arr[Math.floor(Math.random()*l)]) + key;
}

function decodeKey(key){
    if(!key){
        return "";
    }

    return key.replace(/^[a-zA-Z]\#[a-zA-Z][a-zA-Z][a-zA-Z]\#/g,"");
}

/**
 * 加载json文件
 * @param {*文件绝对路径} src
 * 返回object 
 */
function loadJson(src){
    if(fs.exists(src)){
        return JSON.parse(fs.readFileSync(src));
    }
    return {};
}

function formatData(oldData, newData){
    if(typeof oldData === "string"){
        oldData = loadJson(oldData);
    }

    if(typeof newData === "string"){
        newData = loadJson(newData);
    }

}

function deepMerge(oldObj, newObj){
    for(let key in newObj){
        if(newObj.hasOwnProperty(key)){
            let oldT = oldObj[key],
            newT = newObj[key];

            if(oldT){
                if(Object.prototype.toString.call(newT) === "[object Object]"){
                    deepMerge(oldT, newT);
                }else{
                    oldObj[key] = newT;
                }
            }else{
                oldObj[key] = newT;
            }
        }
        
    }
}

/**
 * 验证翻译后的文件转成的对象格式是否正确
 * @param {*obj :需要验证的对象} obj 
 * 1. %s 
 * 2. 冒号
 * 3. 对应的符号匹配问题
 */
function checkLang(obj){
    let errorKey = {};
    let reg1 = new RegExp(/%s/g),
        reg2 = new RegExp(/%S/g),
        reg3 = new RegExp(/[:：]/g);
    for (let key in obj) {
        if (ibj.hasOwnProperty(key)) {
            let val = obj[key];
            if(reg1.test(key)){
                reg1.test(val) || (error[key] = val);
                break;
            }else if(reg1.test(val)){
                reg1.test(key) || (error[key] = val);
                break;
            }

            if(reg2.test(val) !== reg2.test(key) || reg2.test(key)=== true){
                error[key] = val;
                break;
            }

            if(reg2.test(val) !== reg2.test(key)){
                error[key] = val;
                break;
            }
        }
    }
}

exports.formatKey = formatKey;
exports.decodeKey = decodeKey;
exports.ACTIONTYPE = ACTIONTYPE;
exports.deepMerge = deepMerge;
