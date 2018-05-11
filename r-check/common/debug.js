function debug(obj) {
    // global.debug && console.log(arguments.length,typeof obj);
    if (!global.debug) {
        return;
    }
    if (arguments.length > 1) {
        console.log("");
        console.log("[DEBUG]:  ", ...arguments);
        console.log("");
        return;
    }

    if (typeof obj == "string") {
        console.log("");
        console.log(`[DEBUG]:  ${obj}`);
        console.log("");
    } else if (typeof obj == "object") {

        console.log("");
        console.dir("[DEBUG]:");
        Array.isArray(obj) ? console.log(obj.join(",")) : logObj(obj);
        console.log("");
    } else {
        console.log(obj.toString());
    }
}

function logObj(obj) {
    console.log("{");
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            if (typeof obj[prop] == "object") {
                logObj(obj[prop]);
            } else {
                console.log(`${prop} : ${obj[prop]}`);
            }
        }
    }
    console.log("}");
}


module.exports = debug;