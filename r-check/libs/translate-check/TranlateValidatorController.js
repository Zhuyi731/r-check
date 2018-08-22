const console = require("./utils/console");
const fs = require("fs");
const path = require("path");
const ExcelJsonValidator = require("./jsonAndExcel/JsonExcelValidator");
const DupValidator = require("./checkDuplicate/DuplicateCheckValidator");
const JsonCodeValidator = require("./jsonAndCode/JsonCodeValidator");
const ValidatorController = require("../baseClass/ValidatorController");
const config = require("../config");

class TranlateValidatorController extends ValidatorController {
    constructor(options) {
        super();
        this.options = options;
        this.validators = [];
    }

    checkOptions() {
        if (!this.options.cliOptions.checkTranslate) return false;
        let options = this.options.cliOptions,
            rConfigPath = path.join(this.options.cwd, config.configFileName);

        if (!fs.existsSync(rConfigPath)) {
            throw new Error(`没有检测到${config.configFileName}配置文件`);
        }

        this.options.checkOptions = require(rConfigPath);
    }

    _initValidators() {
        this.validators = [{
            mesId: "codeJson",
            validator: new JsonCodeValidator({
                cwd: this.options.cwd,
                checkOptions: this.options.checkOptions.jsonAndCode
            })
        }, {
            mesId: "excelJson",
            validator: new ExcelJsonValidator({
                cwd: this.options.cwd,
                checkOptions: this.options.checkOptions.jsonAndExcel
            })
        }, {
            mesId: "excel",
            validator: new DupValidator({
                cwd: this.options.cwd,
                checkOptions: this.options.checkOptions.checkDuplicate
            })
        }];
    }

    dispatchTask() {
        let errorMessages = {};

        this._initValidators();
        this.validators.forEach(validator => {
            errorMessages[validator.mesId] = validator.validator.run();
        })

        return errorMessages;
    }

}


module.exports = TranlateValidatorController;