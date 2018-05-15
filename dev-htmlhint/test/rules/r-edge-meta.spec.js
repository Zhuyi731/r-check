/**
 * @added by zy @2018.3.16
 * this rule is aim to check whether your header container the meta <meta http-equiv="X-UA-Compatible" content="IE=edge">
 * this will make sure all ie browsers render pages in the same way and avoid some problems
 */

var expect  = require("expect.js");

var HTMLHint  = require("../../index").HTMLHint;

var ruldId = 'r-edge-meta',
    ruleOptions = {};

ruleOptions[ruldId] = true;

describe('Rules: '+ruldId, function(){

    it('头部没有meta标签应该产生error', function(){
        var code = '<head><link href="./css/index.css"><title></title></head>';
        var messages = HTMLHint.verify(code, ruleOptions);
      
        expect(messages.length).to.be(1);
        expect(messages[0].rule.id).to.be(ruldId);
        expect(messages[0].line).to.be(1);
        expect(messages[0].type).to.be('error');
    });

    it('头部有meta标签不应该产生error', function(){
        var code = '<head><meta http-equiv="X-UA-Compatible" content="IE=edge"></head>';
        var messages = HTMLHint.verify(code, ruleOptions);
        expect(messages.length).to.be(0);
    });

});