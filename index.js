var SourceCode = require("./souceCodeTest/sourceCodetest");

sourceCode = new SourceCode("./code/");

/**
 * 源代码检查
 * 1.编码规范检查
 * 2.兼容性css、html、js处理
 * 3.翻译是否成功检查
 * 4.源代码是否有中文检查
 */
sourceCode.test();

/**
 * 
 * 
 * 
 */

