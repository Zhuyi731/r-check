const fs = require("fs");
const path = require("path");
const config = require("../config");
/**
 * 用于生成可视化的HTML文件
 * 便于项目成员查看错误所在的位置以及错误分布情况
 */
class HtmlGenarator {
    constructor(options, cwd) {
        this.cwd = cwd;
        this.options = options;
        this.templatePath = path.join(__dirname, "./template.html");
        this.outputPath = path.join(__dirname, "./Error_Report.html");
        this.noError = "<h1>没有检查出错误</h1>";
        this.rConfig = require(path.join(this.cwd, config.configFileName));
        this.contents = {
            htmlContent: {
                replaceExp: /<!--html-->/,
                countExp: /<!--htmlCt-->/,
                content: "<h1>没有配置该检查</h1>",
                problemCount: 0,
                configed: !this.options.cliOptions.closeCheck && this.options.cliOptions.checkHtml
            },
            cssContent: {
                replaceExp: /<!--css-->/,
                countExp: /<!--cssCt-->/,
                content: "<h1>没有配置该检查</h1>",
                problemCount: 0,
                configed: !this.options.cliOptions.closeCheck && this.options.cliOptions.checkCss

            },
            jsContent: {
                replaceExp: /<!--js-->/,
                countExp: /<!--jsCt-->/,
                content: "<h1>没有配置该检查</h1>",
                problemCount: 0,
                configed: !this.options.cliOptions.closeCheck && this.options.cliOptions.checkJs
            },
            codeJsonContent: {
                replaceExp: /<!--codeJson-->/,
                countExp: /<!--codeJsonCt-->/,
                content: "<h1>没有配置该检查</h1>",
                problemCount: 0,   
                configed:this.options.cliOptions.checkTranslate && this.rConfig.jsonAndCode
            },
            excelJsonContent: {
                replaceExp: /<!--excelJson-->/,
                countExp: /<!--excelJsonCt-->/,
                content: "<h1>没有配置该检查</h1>",
                problemCount: 0,   
                configed:this.options.cliOptions.checkTranslate && this.rConfig.jsonAndExcel
            },
            excelContent: {
                replaceExp: /<!--excel-->/,
                countExp: /<!--excelCt-->/,
                content: "<h1>没有配置该检查</h1>",
                problemCount: 0,   
                configed:this.options.cliOptions.checkTranslate && this.rConfig.checkDuplicate
            },
            encodeContent: {
                replaceExp: /<!--encode-->/,
                countExp: /<!--encodeCt-->/,
                content: "<h1>没有配置该检查</h1>",
                problemCount: 0,   
                configed:this.options.cliOptions.checkEncode 
            }
        }
    }

    creatHtml(messageDatas) {
        this.messageDatas = messageDatas;
        this._creatCodeCheckContents();
        this._creatTranslateCheckContents();
        this._creatEncodeCheckContents();
        this._replaceHtmlContent();
    }

    _creatCodeCheckContents() {
        let options = this.options.cliOptions;

        if (options.closeCheck) return;

        options.checkHtml && this._creatHtmlContent();
        options.checkCss && this._creatCssContent();
        options.checkJs && this._creatJsContent();
    }

    _creatHtmlContent() {
        let htmlMes = this.messageDatas.code.htmlMes;

        this.contents.htmlContent.problemCount = htmlMes.errNum + htmlMes.warnNum;
        htmlMes.messages = htmlMes.messages.map(fileError => {
            fileError.errors = fileError.errors.map(error => {
                error.ruleId = error.rule.id;
                error.link = error.rule.link;
                error.type = error.type == "error" ? "Error" : "Warning";
                return error;
            });
            return fileError;
        });

        this.contents.htmlContent.content = this._creatErrorContent(htmlMes.messages);
    }

    _creatCssContent() {
        let cssMes = this.messageDatas.code.cssMes;

        this.contents.cssContent.problemCount = cssMes.errNum + cssMes.warnNum;
        cssMes.messages = cssMes.messages.map(fileError => {
            fileError.errors = fileError.errors.map(error => {
                error.ruleId = error.rule.id;
                error.link = error.rule.link;
                error.type = error.type == "error" ? "Error" : "Warning";
                return error;
            });
            return fileError;
        });

        this.contents.cssContent.content = this._creatErrorContent(cssMes.messages);
    }

    _creatJsContent() {
        let jsMes = this.messageDatas.code.jsMes;

        this.contents.jsContent.problemCount = jsMes.errNum + jsMes.warnNum;
        jsMes.messages = jsMes.messages.map(fileError => {
            fileError.errors = fileError.errors.map(error => {
                error.link = `https://eslint.org/docs/rules/${error.ruleId}`;
                error.type = error.severity == "1" ? "Warning" : "Error";
                return error;
            });
            return fileError;
        });

        this.contents.jsContent.content = this._creatErrorContent(jsMes.messages);
    }

    /*code-check-parser start*/
    _creatErrorContent(errorMessages) {
        if (!errorMessages) return "";
        let content = "";
        errorMessages.forEach(error => {
            let table = this._creatTableTemplate(error);
            content += table;
        });
        return content;
    }

    _creatTableTemplate(error) {
        let tableTemplate,
            tbodyTemplate = "";

        error.errors.forEach(singleError => {
            singleError.message = this._replaceHtmlTag(singleError.message);
            let trTemplate =
                `<tr>
                <td class="error-line" width="15%"> 第${singleError.line}行 </td>
                <td class="error-type text-danger" width="15%"> ${singleError.severity =="1"?"Warning":"Error"} </td>
                <td class="error-detail" width="55%"> ${singleError.message} </td>
                <td width="15%"><a href="${singleError.link}" target="_blank" >${singleError.ruleId} </a></td>
            </tr>`;
            tbodyTemplate += trTemplate;
        });

        tableTemplate =
            `<table class="table error-table">
            <thead>
                <tr class="danger table-head" colspan="8">
                    <th colspan="8">
                        <span class="plus-minus">[+]</span> ${error.fileName}<span class="total"> ${error.errNum + error.warnNum} problems (${error.errNum} errors, ${error.warnNum} warnings)</span>
                    </th>
                </tr>
            </thead>
            <tbody>
                ${tbodyTemplate}
            </tbody>
        </table>`;

        return tableTemplate;
    }
    /*code-check-parser end*/

    _creatTranslateCheckContents() {
        let options = this.options.cliOptions;

        if (!options.checkTranslate) return;

        this.rConfig.jsonAndCode && this._creatCodeJsonContent();
        this.rConfig.jsonAndExcel && this._creatExcelJsonContent();
        this.rConfig.checkDuplicate && this._creatExcelContent();
    }

    /*code-json start*/
    _creatCodeJsonContent() {
        let codeJsonMes = this.messageDatas.translate.codeJson;
        this.contents.codeJsonContent.problemCount = codeJsonMes.errNum + codeJsonMes.warnNum;
        this.contents.codeJsonContent.content = __creatCodedJsonTableTemplate.call(this, codeJsonMes.messages);

        function __creatCodedJsonTableTemplate(errors) {
            let trTemplate = "",
                tbodyTemplate = "",
                tableTemplate = "",
                totalContent = "";

            errors.forEach(fileError => {
                tbodyTemplate = "";
                fileError.errors.forEach(error => {
                    error = this._replaceHtmlTag(error);

                    trTemplate =
                        `<tr>
                            <td class="error-line" width="15%"> 在"${fileError.lang}"语言中 </td>
                            <td class="error-type text-danger" width="15%"> Error </td>
                            <td class="error-line" width="80%"> "${error}" &nbsp;没有被翻译 </td>
                        </tr>`;
                    tbodyTemplate += trTemplate;
                });

                tableTemplate =
                    `<table class="table error-table">
                        <thead>
                            <tr class="danger table-head" colspan="4">
                                <th colspan="4">
                                    <span class="plus-minus">[+]</span>${fileError.fileName}<span class="total"> ${fileError.errNum} problems (${fileError.errNum} errors, 0 warnings)</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tbodyTemplate}   
                        </tbody>
                    </table>`;
                totalContent += tableTemplate;
            });
            return totalContent;
        }

    }

    _creatExcelJsonContent() {
        let excelJsonMes = this.messageDatas.translate.excelJson;
        this.contents.excelJsonContent.problemCount = excelJsonMes.errNum + excelJsonMes.warnNum;
        this.contents.excelJsonContent.content = __creatExcelJsonTableTemplate(excelJsonMes.messages);

        function __creatExcelJsonTableTemplate(errors) {
            let trTemplate = "",
                tbodyTemplate = "",
                tableTemplate = "",
                totalContent = "";

            errors.forEach(error => {
                tbodyTemplate = "";
                error.errors.forEach(singleError => {
                    trTemplate =
                        `<tr>
                            <td class="error-line" width="25%"> ${error.lang} </td>
                            <td width="25%"> ${singleError.key} </td>
                            <td width="25%"> ${singleError.excel} </td>
                            <td width="25%"> ${singleError.json} </td>
                        </tr>`;
                    tbodyTemplate += trTemplate;
                });
                tableTemplate =
                    `<table class="table error-table">
                    <thead>
                        <tr class="danger table-head">
                            <th><span class="plus-minus">[+]</span>${error.lang}<span class="total">(${error.errNum} errors)</span></th>
                            <th> key值 </th>
                            <th> Excel值 </th>
                            <th> Json值 </th>
                        </tr>
                    </thead>
                    <tbody>
                       ${tbodyTemplate}
                    </tbody>
                </table>`;
                totalContent += tableTemplate;
            });
            return totalContent;

        }
    }

    _creatExcelContent() {
        let excelMes = this.messageDatas.translate.excel;
        this.contents.excelContent.problemCount = excelMes.errNum + excelMes.warnNum;
        this.contents.excelContent.content = __creatExcelTableTemplate.call(this, excelMes.messages);

        function __creatExcelTableTemplate(errors) {
            let trTemplate = "",
                tbodyTemplate = "",
                tableTemplate = "",
                totalContent = "";

            errors.forEach(error => {
                error.key = this._replaceHtmlTag(error.key);
                trTemplate =
                    `<tr>
                        <td width="20%"> ${error.firstLine} </td>
                        <td width="20%"> ${error.lastLine} </td>
                        <td width="60%"> ${error.key} </td>
                    </tr>`;
                tbodyTemplate += trTemplate;
            });
            tableTemplate =
                `<table class="table error-table active">
                    <thead>
                        <tr class="danger table-head" colspan="8">
                            <th> 第一次出现行数 </th>
                            <th> 第二次出现行数 </th>
                            <th> Key值 </th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tbodyTemplate}
                    </tbody>
                </table>`;
            totalContent += tableTemplate;
            return totalContent;
        }
    }

    _creatEncodeCheckContents() {
        let encodeMes = this.messageDatas.encode,
            trTemplate,
            tbodyTemplate = "",
            tableTemplate = "";

        this.contents.encodeContent.problemCount = encodeMes.errNum + encodeMes.warnNum;
        if (this.contents.encodeContent.problemCount == 0) {
            this.contents.encodeContent.content = this.noError;
            return;
        }

        encodeMes.messages.forEach(error => {
            trTemplate =
                `<tr>
                    <td > ${error.fileName} </td>
                    <td > ${error.fileType} </td>
                    <td > ${error.confidence} </td>
                </tr>`;
            tbodyTemplate += trTemplate;
        });

        tableTemplate =
            `
            <table class="table error-table active">
                <thead>
                    <tr class="danger table-head" colspan="8">
                        <th> 文件路径 </th>
                        <th> 编码格式 </th>
                        <th> 确信度 </th>
                    </tr>
                </thead>
                <tbody>
                    ${tbodyTemplate}
                </tbody>
            </table>`;

        this.contents.encodeContent.content = tableTemplate;
    }

    _replaceHtmlContent() {
        let prop,
            curConfig,
            htmlContent = fs.readFileSync(this.templatePath, "utf-8");

        for (prop in this.contents) {
            if (this.contents.hasOwnProperty(prop)) {
                curConfig = this.contents[prop];
                if(curConfig.configed && curConfig.problemCount == 0){
                    curConfig.content = this.noError;
                }

                htmlContent = htmlContent.replace(curConfig.countExp, curConfig.problemCount);
                htmlContent = htmlContent.replace(curConfig.replaceExp, curConfig.content);
            }
        }
        fs.writeFileSync(this.outputPath, htmlContent, "utf-8");
    }

    _replaceHtmlTag(text) {
        return text.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
};

module.exports = HtmlGenarator;