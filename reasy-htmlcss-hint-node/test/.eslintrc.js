module.exports = {
  //因为有ES6语法 ，需要先用babel进行转换才能正确识别，否则会报错 import有错误之类的
  // parser: "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 6
  },
  rules: {
    /*
     *以下的 off||0代表关闭  warm||1代表抛出Error，不会使编译退出  
     *error||2代表抛出错误，会导致编译退出
     *其中增加了process.env.NODE_ENV变量   
     *process.env.NODE_ENV==='publish'表示发布环境 
     *process.env.NODE_ENV==='dev'表示开发调试环境，可以通过这个来配置不同环境下的检查项
     */
    //以下为配置项	
    //详细文档       http://eslint.cn/docs/rules
    "quotes": [0, "double"], //引号类型  强制 "" '' 
    "semi": [1, "always"], //语句强制分号结尾
    "no-console": process.env.NODE_ENV === 'publish' ? 2 : 0, //不允许console  建议调试环境关闭 
    "no-alert": 1, //禁止使用alert confirm prompt
    "no-cond-assign": 2, //禁止在条件表达式中使用赋值语句
    "no-const-assign": 2, //禁止修改const声明的变量
    "no-constant-condition": 2, //禁止在条件中使用常量表达式 if(true) if(1)
    "no-debugger": process.env.NODE_ENV === 'publish' ? 2 : 0, //禁止使用debugger  建议调试环境关闭
    "no-div-regex": 1, //不能使用看起来像除法的正则表达式/=foo/
    "no-dupe-keys": 2, //在创建对象字面量时不允许键重复 {a:1,a:1}
    "no-dupe-args": 2, //函数参数不能重复
    "no-duplicate-case": 2, //switch中的case标签不能重复
    "no-empty": 0, //块语句中的内容不能为空
    "no-eq-null": 0, //禁止对null使用==或!=运算符
    "no-eval": 0, //禁止使用eval
    "no-ex-assign": 1, //禁止给catch语句中的异常参数赋值
    "no-extend-native": 0, //禁止扩展native对象   禁止修改prototype
    "no-extra-parens": 0, //禁止非必要的括号   有时候多余的括号能使逻辑更清晰
    "no-extra-semi": 2, //禁止多余的冒号
    "no-floating-decimal": 2, //禁止省略浮点数中的0 .5 3.
    "no-func-assign": 2, //禁止重复的函数声明
    "no-inline-comments": 0, //禁止行内备注
    "no-inner-declarations": [0, "functions"], //禁止在块语句中使用声明（变量或函数）
    "no-multiple-empty-lines": [1, {
      "max": 3
    }], //空行最多不能超过3行
    "arrow-parens": 0, //箭头函数用小括号括起来
    "arrow-spacing": 0, //=>的前/后括号
    "camelcase": 1, //强制驼峰法命名
    "comma-spacing": 0, //逗号前后的空格
    "comma-style": [0, "last"], //逗号风格，换行时在行首还是行尾
    "consistent-return": 0, //return 后面是否允许省略
    "consistent-this": [0, "that"], //this别名
    "default-case": 0, //switch语句最后必须有default
    "dot-location": 0, //对象访问符的位置，换行的时候在行首还是行尾
    "dot-notation": [0, {
      "allowKeywords": true
    }], //避免不必要的方括号
    "eqeqeq": 0, //必须使用全等
    "guard-for-in": 0, //for in循环要用if语句过滤
    "id-length": 0, //变量名长度
    "init-declarations": 0, //声明时必须赋初值
    "new-cap": 0, //函数名首行大写必须使用new方式调用，首行小写必须用不带new方式调用        由于组件的使用都是大写  暂时关闭
    "new-parens": 2, //new时必须加小括号
    "one-var": 0, //连续声明    最好不要开启，要不满屏的绿色 
    "operator-linebreak": [0, "after"], //换行时运算符在行尾还是行首
    "padded-blocks": 0, //块语句内行首行尾是否要空行
    "quote-props": [2, "always"], //对象字面量中的属性名是否强制双引号     consistent-as-needed：如果有属性名称要求使用引号，则所有的属性名称都要使用引号；否则，禁止所有的属性名称使用引号
    "radix": 0, //parseInt必须指定第二个参数
    "id-match": 0, //命名检测
    "semi-spacing": [0, {
      "before": false,
      "after": true
    }], //分号前后空格
    "sort-vars": 0, //变量声明时排序
    "space-after-keywords": [0, "always"], //关键字后面是否要空一格
    "use-isnan": 2, //禁止比较时使用NaN，只能用isNaN()
    "valid-typeof": 2, //必须使用合法的typeof的值
    "vars-on-top": 0 //var必须放在作用域顶部
  }
}