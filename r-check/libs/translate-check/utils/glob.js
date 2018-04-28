var minimatch = require('minimatch');

module.exports = function(pattern, str, options) {
    var regex;

    // 由于minimatch提供的glob支持中()语法不符合fis glob的需求，因此只针对()单独处理
    var hasBracket = ~pattern.indexOf('(');
    // 当用户配置 *.js 这种写法的时候，需要让其命中所有所有目录下面的。
    if (/^(\(*?)(?!\:|\/|\(|\*\*)(.*)$/.test(pattern)) {
        pattern = '**/' + pattern;
    }
    // support special global star
    // 保留原来的 **/ 和 /** 用法，只扩展 **.ext 这种用法。
    pattern = pattern.replace(/\*\*(?!\/|$)/g, '\uFFF0gs\uFFF1');
    if (hasBracket) {
        pattern = pattern.replace(/\(/g, '\uFFF0/').replace(/\)/g, '/\uFFF1');
    }
    regex = minimatch.makeRe(pattern, options || {
        matchBase: true,
        // nocase: true
    });
    pattern = regex.source;
    pattern = pattern.replace(/\uFFF0gs\uFFF1/g, '(?!\\.)(?=.).*');
    if (hasBracket) {
        pattern = pattern.replace(/\uFFF0\\\//g, '(').replace(/\\\/\uFFF1/g, ')');
    }
    regex = new RegExp(pattern, regex.ignoreCase ? 'i' : '');

    if (typeof str === 'string') {
        return regex.test(str);
    }
    return regex;
};
