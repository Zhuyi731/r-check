const TranlateValidatorController = require("./translate-check/TranlateValidatorController");
const EncodeCheckValidatorController = require("./encode-check/EncodeCheckValidatorController");
const HtmlGenerator = require("./generator/htmlGenerator");
const CodeCheckValidatorController = require("./code-check/CodeCheckValidatorController");
//   _
//  | |__ _ _ __  _
//  | '_ \| | | |/ _` |
//  | |_) | |_| | (_| |
//  |_.__/ \__,_|\__, |    bug警告！
//              |___/

function entry(cwdPath, options) {
    let messages = {
        code: null,
        translate: null,
        encode: null
    };
    let validatorControllers = [{
        name: "code",
        description: "编码规范检查",
        validator: new CodeCheckValidatorController({
            cwd: cwdPath,
            cliOptions: options
        })
    }, {
        name: "translate",
        description: "翻译检查",
        validator: new TranlateValidatorController({
            cwd: cwdPath,
            cliOptions: options
        })
    }, {
        name: "encode",
        description: "编码检查",
        validator: new EncodeCheckValidatorController({
            cwd: cwdPath,
            cliOptions: options
        })
    }];

    try {
        validatorControllers.forEach(validatorController => {
            messages[validatorController.name] = validatorController.validator.run();
        });
    } catch (e) {
        console.log(e);
    }

    try {
        let generator = new HtmlGenerator({
            cliOptions: options,
            cwd: cwdPath
        });
        generator.creatHtml(messages);
    } catch (e) {
        console.log(e);
    }

}

module.exports = entry;