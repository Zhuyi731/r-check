#!/usr/bin/env node

/**
 *dependencies
 */
var program = require("commander");
var args = process.argv;
const sourceCode = require("../index");
const fs = require("fs");
const path = require("path");

/**
 * 当输入reasy-check -h是会显示下列帮助信息
 */
program.version(require('../package').version)
    .usage('<command> [options]')
    .option("-P", "--path <config path>", "The path of your config file")
    .option("-C", "--close-css", "Close css check")
    .option("-H", "--close-html", "Close html check")
    .parse(args);

var options = generateOptions(args);
sourceCode(process.cwd(), options);

/**
 * 根据cli的输入生成配置项
 */
function generateOptions() {
    let defaultOptions = {
        checkCss: true,
        checkHtml: true,
        checkJs: false,
        optionsPath: null
    }
    for (var i = 2; i < args.length; i++) {
        if (args[i] == "-P" || args[i] == "--path") {
            defaultOptions.optionsPath = args[i + 1];
        }
        if (args[i] == "-C" || args[i] == "--close-css") {
            defaultOptions.checkCss = false;
        }
        if (args[i] == "-H" || args[i] == "--close-html") {
            defaultOptions.checkCss = false;
        }
    }
    return defaultOptions;
}