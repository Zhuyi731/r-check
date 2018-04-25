
var path = require('path'),
    xlsxWriter = require('./xlsx-write'),
    fs = require('fs');
var spliter = '\t**--**\t';

exports.b28lib = function() {
    var coreVersion = "4.0",
        MSG = {},
        MSGCopy = {},
		transfileType = "",
        trim = function(text) {
            return text.trim();
        },
        pageRemark = [],
        parseJSON = function(data) {
            // JSON RegExp
            var rvalidchars = /^[\],:{}\s]*$/,
                rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
                rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
                rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g;

            if (data === null) {
                return data;
            }

            if (typeof data === "string") {
                // Make sure leading/trailing whitespace is removed (IE can't handle it)
                data = trim(data);

                if (data) {
                    // Make sure the incoming data is actual JSON
                    // Logic borrowed from http://json.org/json2.js
                    if (rvalidchars.test(data.replace(rvalidescape, "@")
                            .replace(rvalidtokens, "]")
                            .replace(rvalidbraces, ""))) {

                        return (new Function("return " + data))();
                    }
                }
            }
        },
        gettext = function(text, file) {//替换翻译
            var ret;
			if(transfileType == "json") {
				ret = MSG[text];

			} else {
				var fileJSON = file.split("\\").slice(-1)[0];
				if(MSG[fileJSON]) {
					
					ret = MSG[fileJSON][text];
				} else {
					ret = MSG[text];
				}
			}
			
            if (!ret) {
                pageRemark.push(addInfo(text, '', 0, file));
                return text;
            } else {
                delete MSGCopy[text];
                return ret;
            }
        },
        loadData = function(data) {
            var json = parseJSON(data);
            if (json !== '') {
                for (var key in json) {
                    if (key !== 'undefined') {
                        MSG[json[key]] = key;
                    }
                }
            }
        },
        getRemark = function() {
            return pageRemark;
        },
        loadJSON = function(json) {//加载语言包
            if (typeof json == 'string') json = eval('(' + json + ')');
            
			if (json !== '') {
                if(transfileType === "json") {
					for (var key in json) {
						if (key !== 'undefined') {
							//console.log("KEY========="+key+"MSG[key]=========="+json[key])
							//代码ID与value相同时	
							//MSG[json[key]] = key;
							//代码ID与语言包的KEY相同时
							MSG[key] = json[key];
							
						}
					}
				} else {
					MSG = clone(json);
				}
            }
            //深度克隆
            MSGCopy = clone(MSG);
        },
        transTitle = function(doc, file) {
            var titleElem = doc.getElementsByTagName("title")[0],
                transTitleText;

            if (titleElem && titleElem.getAttribute("id") &&
                /\S/.test(titleElem.getAttribute("id"))) {
                transTitleText = titleElem.getAttribute("id");
            } else {
                transTitleText = doc.title;
            }
            pageRemark.push(addComment(file));
            doc.title = gettext(trim(transTitleText), file);
        },
        replaceTextNodeValue = function(element, file) {
            if (!element) {
                return;
            }
            var firstChild = element.firstChild,
                nextSibling = element.nextSibling,
                nodeType = element.nodeType,
                btnStr = "submit,reset,button",
                curValue, isInputButton, isDataOption;

            //handle element node
            if (nodeType === 1) {

                // Hander elements common attribute need to replace
                curValue = element.getAttribute("alt");
                if (curValue && /\S/.test(curValue)) {
                    curValue = trim(curValue);
                    element.setAttribute("alt", gettext(curValue, file));
                }
                curValue = element.getAttribute("placeholder");
                if (curValue && /\S/.test(curValue)) {
                    curValue = trim(curValue);
                    element.setAttribute("placeholder", gettext(curValue, file));
                }
                curValue = element.getAttribute("title");
                if (curValue && /\S/.test(curValue)) {
                    curValue = trim(curValue);
                    element.setAttribute("title", gettext(curValue, file));
                }
                //data-title翻译替换
                 curValue = element.getAttribute("data-title");
                if (curValue && /\S/.test(curValue)) {
                    curValue = trim(curValue);
                    element.setAttribute("data-title", gettext(curValue, file));
                }

                isInputButton = element.nodeName.toLowerCase() == "input" &&
                    (btnStr.indexOf(element.getAttribute("type")) !== -1);
                if (isInputButton) {

                    //data-lang属性具有较高优先级
                    curValue = element.getAttribute("data-lang") || element.value;
                } else {
                    curValue = element.getAttribute("data-lang");
                }
                //Reasy-Ui里有data-options验证的提示信息需要替换翻译
                if(element.getAttribute('data-options')) {
                    isDataOption = true;
                    curValue = JSON.parse(element.getAttribute('data-options')).msg;
                }


                if (curValue && /\S/.test(curValue)) {
                    curValue = trim(curValue);
                    if (curValue) {
                        if (isInputButton) {
                            element.setAttribute("value", gettext(curValue, file));
                        } else if(isDataOption) {
                            element.setAttribute('data-options', element.getAttribute('data-options').replace(curValue, gettext(curValue, file)));
                        } else {
                            element.innerText = gettext(curValue, file);
                        }
                    }
                }

                //handle textNode
            } else if (nodeType === 3 && /\S/.test(element.nodeValue)) {
                curValue = trim(element.nodeValue);
                element.nodeValue = gettext(curValue, file);
            }
            //translate firstChild
            //stop handle elem.child if elem has attr data-lang
            if (firstChild && (!element.getAttribute || !element.getAttribute("data-lang"))) {
                replaceTextNodeValue(firstChild, file);
            }

            //translate siblings
            if (nextSibling) {
                replaceTextNodeValue(nextSibling, file);
            }
        };

    function unique(inputs) { //用哈希表去重
        var res = [];
        var json = {};
        if (!inputs) {
            return [];
        }
        for (var i = 0; i < inputs.length; i++) {
            if (!json[inputs[i]]) {
                res.push(inputs[i]);
                json[inputs[i]] = 1;
            }
        }
        return res;
    }

    function translatePage(content, file) {
        pageRemark.push(addComment(file));
        return replaceTextNodeValue(content, file);
    }
    //替换js翻译函数
    function replaceRes(content, file) {
        console.log('带参数的翻译项   content='+content)
        var res = content.replace(/(_\(")(.*?)(]\))|(")(.*?)(")|(_\(")(.*?)("\))/g, function(key) {
            var quote = "\"";
            //console.log('带参数的翻译项   替换前ssss='+key)
            //解决key翻译中带有\"导致未翻译的问题
            key = key.replace(/(\\")/g, "\"");
            //解决key翻译中带有\\导致未翻译的问题
            key = key.replace(/(\\\\)/g, "\\");
            if(/(_\(")(.*?)(]\))/g.test(key)) {
                //console.log('带参数的翻译项   替换前=0'+key)
                //翻译中参数带翻译
                key = "_(" + replaceRes(key.slice(2, -1)) + ")";

                key = key.replace(/(")(.*?)("),/, function(keyRep) {
                    keyRep = keyRep.slice(1, -2);
                    //console.log('带参数的翻译项   替换前keyRep='+keyRep)
                    if(MSG[keyRep]) {
                        delete MSGCopy[keyRep];
                        return quote + MSG[keyRep] + quote + ",";
                    } else {
                        pageRemark.push([key,file].join(spliter));
                        return quote + keyRep + quote + ",";
                    }
                });
                //console.log('带参数的翻译项     替换后='+key);
                return key;
            } else if(/(_\(")(.*?)("\))/g.test(key)) {//下划线翻译处理
                //console.log('带参数的翻译项   替换前=1'+key)
                if (key !== '') {
                    key = key.slice(3, -2);
                    if(MSG[key]) {
                        delete MSGCopy[key];//删除备份中的元素，以便检视为翻译元素
                        return "_(" + quote + MSG[key] + quote + ")";
                    } else {
                        pageRemark.push([key,file].join(spliter));
                        return "_(" + quote + key + quote + ")";
                    }
                } else {
                    return;
                }
            } else {
                //console.log('带参数的翻译项   替换前=2'+key)
                key = key.slice(1, -1);
            }

            //key = key.trim();
            if (MSG[key]) {
                delete MSGCopy[key];
                return "_(" + quote + MSG[key] + quote + ")";
            } else {
                pageRemark.push([key,file].join(spliter));
                return quote + key + quote;
            }

        });
        return res;
    }

    function translateRes(content, file) {//替换js中的翻译
        pageRemark.push(addComment(file));
        content = replaceRes(content, file);
        return content;
    }

    function writeText(filename, content) { //以文本形式写入
        fs.writeFileSync(filename, content);
        console.log(filename + ' success saved!');
    }

    function writeFile(saveTo, array) { //文件写入
        saveTo = path.resolve(saveTo);
        if (/\.xlsx$/.test(saveTo)) {
            writeExcel(saveTo, unique(array, 1));
        } else {
            writeText(saveTo, unique(array, 1).join("\r\n"));
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
        console.log(filename + ' success saved!');
    }

    function GetPageData() {//提取html页面关键字
        var nodeValueArray = [],
            onlyZH = false,
            pageConent = '',
            page = '';

        function _getValue(curValue) {
            if (curValue && /\S/.test(curValue)) {
                curValue = trim(curValue);
                if (onlyZH) { //是否存在中文
                    if (/[\u4e00-\u9fa5]/.test(curValue)) {
                        nodeValueArray.push(curValue);
                    }
                } else if (/[a-z]/i.test(curValue) || /[\u4e00-\u9fa5]/.test(curValue)) {//中英文都提取
                    nodeValueArray.push(curValue);
                } else {
                    pageRemark.push([curValue,page].join(spliter));
                }
            }
        }

        function listNode(element) {
            if (!element) {
                return;
            }
            var firstChild = element.firstChild,
                nextSibling = element.nextSibling,
                nodeType = element.nodeType,
                nodeName = element.nodeName.toLowerCase(),
                btnStr = "submit,reset,button",
                curValue, isInputButton, isDataOption;
            //handle element node
            if (nodeType === 1) {
                curValue = element.getAttribute("data-hong");
                if(curValue && global.CONST[curValue] !== "y"){
                    //translate siblings
                    if (nextSibling) {
                        listNode(nextSibling);
                    }
                    return;
                }
                if(element.getAttribute("data-nowrap") == 1){
                    _getValue(element.innerHTML);

                    if (nextSibling) {
                        listNode(nextSibling);
                    }
                    return;
                }

                if (nodeName == 'script' || nodeName == 'style') {
                    if (nodeName == 'script') {
                        if (firstChild && firstChild.nodeValue && trim(firstChild.nodeValue)) {
                            nodeValueArray = nodeValueArray.concat(GetResData(firstChild.nodeValue, onlyZH, page).reverse());
                        }
                    }
                    firstChild = null; //不再检索script,style的内容
                }

                // Hander elements common attribute need to replace
                curValue = element.getAttribute("alt");
                _getValue(curValue);
                //added by zy 添加data-title的翻译提取
                 curValue = element.getAttribute("data-title");
                _getValue(curValue);

                curValue = element.getAttribute("placeholder");
                _getValue(curValue);

                curValue = element.getAttribute("title");
                _getValue(curValue);

                isInputButton = element.nodeName.toLowerCase() == "input" &&
                    (btnStr.indexOf(element.getAttribute("type")) !== -1);

                if(element.getAttribute('data-options')) {
                    isDataOption = true;
                }

                if (isInputButton) {
                    //data-lang属性具有较高优先级
                    curValue = element.getAttribute("data-lang") || element.value;
                } else if(isDataOption) {
                    try{
                        curValue = JSON.parse(element.getAttribute('data-options')).msg;
                    }
                    catch(e){
                        console.log("data-option 不是json格式数据")
                    }
                    
                } else {
                    curValue = element.getAttribute("data-lang");
                }

                _getValue(curValue);


                //handle textNode
            } else if (nodeType === 3 && /\S/.test(element.nodeValue)) {
                curValue = trim(element.nodeValue);
                _getValue(curValue);
            }

            //translate firstChild
            //stop handle elem.child if elem has attr data-lang
            if (firstChild) {
                listNode(firstChild);
            }

            //translate siblings
            if (nextSibling) {
                listNode(nextSibling);
            }
        }

        this.getNodeValue = function(element, _onlyZH, _page) {
            //清空节点
            nodeValueArray = [];
            if (!element) {
                return "";
            }
            onlyZH = _onlyZH;
            page = _page;
            pageConent = element && element.outerHTML || '';
            pageRemark.push(addComment(page));
            nodeValueArray.push(addComment(page));
            listNode(element);
    
            return unique(nodeValueArray);
        };
    }

    function PosToRow(str) {
        var oldpos = 0;
        var coderow = 0;
        var regExp = str.indexOf('\r\n') > -1 ? new RegExp('\\r\\n', 'g') : str.indexOf('\n') > -1 ? new RegExp('\\n', 'g') : new RegExp('\\r', 'g');

        //console.log(regExp);
        return function(pos) {
            var pre = str.substring(oldpos, pos);
            oldpos = pos;
            var submatch = pre.match(regExp);
            coderow += submatch ? submatch.length : 0;
            return coderow + 1;
        };
    }

    function addComment(str) {
        return '/*----------------------   ' + str + '    ----------------------*/';
    }

    function addInfo(str, data, pos, file) {
        var posToRow = PosToRow(data);
        var row = posToRow(pos);
        return [
        str, 
        '  行号:' + row + '  文件:' + file, 
        'http://127.0.0.1:8813/execute.html?execute://' + path.dirname(__dirname) + '\\execute\\notepad2.exe /r /g ' + row + ' ' + file,
        data.substring(data.lastIndexOf('\n', pos - 10), data.indexOf('\n', pos + 10)).replace(/[\n\r]/g, '   ')
        ].join(spliter);
        //增加代码摘要，+-10为缓冲范围
        //console.log(data.lastIndexOf('\n', pos - 10), data.indexOf('\n', pos + 10)
    }

    function filter(keys, key, index) {

        return keys.some(function(v) {
            //console.log(index, key, key.lastIndexOf(v));
            if (v === key || key.lastIndexOf(v) === (index - v.length)) return true;
        });
    }

    //获取js资源文件内语言,对于注释的代码和宏功能为开启的代码不进行提取
    function GetResData(data, onlyZH, file) { 
        //console.log("data=" + data + " onlyZH=" + onlyZH + " file=" + file);
        var regqutoe = new RegExp(/((["'])(?:\\.|[^\\\n])*?\2)/g);//获取""和''内的内容包括引号
        var ignoreKeyWord = ['$(', '<%', 'getElementById(', 'find(', 'addClass(', '$.post(', '$.get(', 'delegate(', 'case ', 'hasClass(', 'indexOf(', 'getElementsByTagName(', 'getElementsByClassName(', 'on(', 'setTextDomain(['];
        var matchKeyWord = ['_(', 'showMsg(', 'MSG['];
        var maxBackLen = 25; //定义最长回溯长度,一般js里的关键字长度不会超过25

        var ret = [], tempData = data, hongNames = [];

        pageRemark.push(addComment(file));

        //add by xc 
        //判断宏控制的功能是否开启，若未开启则移除代码
        //宏控制的功能代码段特殊标记/*<宏名称>*/ xxxxx /*-宏名称-*/，若只有单个标记则直接忽略
        data.replace(/((\/\*<)(.*?)(>\*\/))/g, function(match){
            let hongName = match.replace(/\/\*</,"").replace(/>\*\//,"").replace(/(^\s+)|(\s+$)/g,"");
            if(hongNames.indexOf(hongName) === -1){
                hongNames.push(hongName);
                //若功能关闭，则移除标签段内的所有代码
                if(global.CONST[hongName] !== "y"){
                    let reg = new RegExp('(\\/\\*<( *)'+ hongName +'( *)>\\*\\/)((.|\\s)*?)(\\/\\*-( *)'+ hongName + '( *)-\\*\\/)',"g");
                    tempData = tempData.replace(reg, "");
                }
            }
        });

        data = tempData;

        //对于已注释的代码不进行提取操作
        //去除 /* xxx */ 或者// 注释的代码段
        data = data.replace(/((\/\*)((.|\s)*?)(\*\/))|((\/\/)((?:\\.|[^\\\n])*?)(\n))/g,"");
        //end

        data.replace(regqutoe, function(matches) {
            //console.log("matches=" + matches);
            matches = matches.slice(1, matches.length - 1);
            if (matches.trim().length > 0) {
                if (/[\u4e00-\u9fa5]/.test(matches)) { //是否含有中文
                    ret.push(matches);
                } else if (!onlyZH) {
                    if (matches.trim().length > 1 && /[a-z]/i.test(matches)) {
                        var backLength = arguments[3] >= maxBackLen ? maxBackLen : arguments[3]; //计算回溯长度,一般js里的关键字长度不会超过25

                        var backStr = data.substr(arguments[3] - backLength, backLength);
                     
                        if (filter(matchKeyWord, backStr, backLength) || (matches.indexOf(' ') > -1 && !/^[#\.]|/.test(trim(matches)))) { //回溯查找
                            ret.push(matches);
                        } else if (!filter(ignoreKeyWord, backStr, backLength)) { //无法确定的string添加摘要后输出
                            //ret.push(addInfo(matches, data, arguments[3], file));
                            pageRemark.push(addInfo(matches, data, arguments[3], file));
                        }
                    }
                }
            }
        });
        if (file)ret.unshift(addComment(file));//将文件名添加进来
        //console.log("ret444444444=" + ret);
        return unique(ret);
    }

    //深度克隆对象
    function clone(obj) { 
    　　var newObj = {}; 

    　　for(var i in obj) { 
    　　　　if(typeof(obj[i]) == 'object' || typeof(obj[i]) == 'function') { 
    　　　　　　newObj[i] = clone(obj[i]); 
    　　　　} else{ 
    　　　　　　newObj[i] = obj[i]; 
    　　　　} 
    　　} 

    　　return newObj; 
    }

    function getUnTranslate() {
        return MSGCopy;
    }
	
	function translateFileType(filetype) {
		transfileType = filetype;
	}

    return {
        loadJSON: loadJSON,
        loadData: loadData,
        translatePage: translatePage,
        translateRes: translateRes,
        transTitle: transTitle,
        getPageData: new GetPageData().getNodeValue, //获取html内语言
        getResData: GetResData, //获取js等文件语言
        coreVersion: coreVersion,
        getUnTranslate: getUnTranslate,
        getRemark: getRemark,
		translateFileType: translateFileType
    };
}();
