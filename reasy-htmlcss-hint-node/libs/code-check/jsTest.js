const eslint = require("eslint/lib/cli");
const path = require("path");
let c = process.cwd().split("\\");
c =  c.pop();

let args = ["eslint", path.join(process.cwd(),"../"), "-o", "index.json", "-f", "json",c];

function test(path,options){
    console.log( path.join(process.cwd(),"../"));
    
}


//
eslint.execute(args);


module.exports = test;