const TranlateValidatorController = require("./translate-check/TranlateValidatorController");
const EncodeCheckValidatorController = require("./encode-check/EncodeCheckValidatorController");
const HtmlGenerator = require("./generator/htmlGenerator");
const CodeCheckValidatorController = require("./code-check/CodeCheckValidatorController");

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
    messages.code = validatorControllers[0].validator.run();

    messages.translate = validatorControllers[1].validator.run();

    messages.encode = validatorControllers[2].validator.run();

    let generator = new HtmlGenerator({
        cliOptions: options
    }, cwdPath);
    generator.creatHtml(messages);

}

module.exports = entry;