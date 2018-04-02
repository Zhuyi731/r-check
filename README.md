# reasy-html-hint-node
扩展于htmlHint&&csslint  
用于Node环境下检查css和html的语法规范

#安装
1.npm install reasy-html-hint-node -g (记得加入-g命令全局安装，安装时会自动生成r-check.cmd脚本文件)  
2.下载完成后输入r-check -V（大写）来检查是否安装成功    
3.进入需要检查的项目根目录  
4.在cmd黑色窗口里运行r-check即可检查  
5.检查之后会在更目录多出一个errorLog文件夹，errorLog文件夹下有html及css两个子文件夹，分别保存两者的错误信息  
6.在cmd中，可以输入r-check -V查看当前版本  
7.在cmd中,输入r-check -h查看其他配置参数，配置参数具体用法参考[CLI参数](#CLI参数)  

![r-check.png]("imgs/r-check.png")

#目录结构

	ROOT:.
	├─bin   //二进制文件,用于生成r-check.cmd
	├─common //默认配置，utils
	├─custom-csslint  //自定义的csslint插件
	│  └─dist
	├─custom-htmlhint  //自定义的htmlhint插件
	│  ├─bin
	│  │  └─formatters
	│  ├─lib
	│  └─node_modules
	│      ├─.bin
	│      ├─csslint
	│      │  └─lib
	│      └─parserlib
	│          └─lib
	├─libs          //源文件代码
	├─test          //用于测试的代码
	└─index.js      //入口文件   


## CLI参数 
输入r-check -h可以查看能够配置的参数  

-P 或者 --path配置配置文件的路径(配置文件详细内容见[配置文件](配置文件));  
用法： r-check -P config/config.js  
这条命令会去读取当前路径下config文件夹下config.js作为配置  
配置-P或者--path之后将不会采用默认的配置文件，而是使用自定义的配置  

-H 或者  --close-html 关闭HTML语法检查    
-C 或者  --close-css  关闭CSS语法检查  

-V 或者 --version 查看版本信息  
-h 或者 --help 查看帮助

##配置文件  
配置文件包含三个部分  
- HTML语法检查规则  
- CSS语法检查规则  
- 错误日志路径  

默认配置文件配置如下  

	var options = {
    "htmlCheckOptions": {
        //标签名 小写
        "tagname-lowercase": true,
        //属性名称小写
        "attr-lowercase": false,
        //属性值使用双引号    
        "attr-value-double-quotes": true,
        //属性值不能为空    
        "attr-value-not-empty": false,
        //属性值不能重定义    
        "attr-no-duplication": true,
        //html标签在头部    
        "doctype-first": false,
        //标签配对    
        "tag-pair": true,
        //标签自闭    
        "tag-self-close": false,
        //id唯一
        "id-unique": true,
        //src非空
        "src-not-empty": true,
        //title必须    
        "title-require": false,
        //alt必须    
        "alt-require": false,
        //<!DOCTYPE>检查
        "doctype-html5": false,
        //文件内部样式禁止    
        "style-disabled": false,
        //内联css机制    
        "inline-style-disabled": false,
        //内联js禁止    
        "inline-script-disabled": false,
        //属性特殊字符检查    
        "attr-unsafe-chars": false,
        //头部js文件检查
        "head-script-disabled": false,
		//自定义规则
		//检查IE 头部是否加入meta进行兼容
		'IE-meta':true,
		"placeholder":true
    },
    //英文原文文档
    //https://github.com/CSSLint/csslint/wiki/
    "cssCheckOptions": {
        //是否检测 !important
        "important": false,
        //是否允许 .bar.foo 这种两个连在一起的选择器
        "adjoining-classes": false,
        //未知属性检测
        "known-properties": false,
        //重复属性检测
        "duplicate-properties": true,
        //border-box 和 box-sizing检测
        "box-sizing": false,
        //width、height 与 border  padding值一起使用时 发出警告
        "box-model": false,
        //display与一些其他值不能同时使用  
        //如 inline 不能与height同时使用   block不能使用 vertical-align   table-*不能使用float
        "display-property-grouping":true,
        //不允许使用重复的背景图片   如果是精灵图  背景图在一个公共的类里引用 其他类用于调整位置
        "duplicate-background-images":true,
        //gradient 这种需要跨浏览器兼容的属性应该写在一起  避免漏改
        "gradients":true,
        //rgba  hsl  hsla这种类型的颜色会提出警告
        "fallback-colors":true,
        //font-size的声明不应该超过10条  
        "font-sizes":false,
        //@font-face  这种外部字体规则不要引入太多
        "font-faces":false,
        //float条数超过10条时，警告
        "floats":false,
        //以*开头的属性检测    如  *width  检测到会报错
        "star-property-hack":false,
        //以_开头的属性检测
        "underscore-property-hack":false,
        //若有  outline:0 或 outline:none的情况并且选择器没有:focus伪类  警告   
        //或者选择器有:focus伪类 但是只有outline一条属性 警告
        "outline-none":false,
        //不允许导入css  @import url(more.css);
        "import":true,
        //id选择器不要放在头部  例如  #head a{}这种  应该单独使用  因为css解析从右向左解析，这样反而降低了效率
        "ids":false,
        //h1-h6应该在头部定义 而不能再子类中再次定义 例如.box h3 {font-weight: normal;}是不行的
        //.item:hover h3 { font-weight: bold; } 也是不行的    正确的是  h3{font-weight:normal}
        "qualified-headings":false,
        //如果你把 margin的top bottom left right都定义一遍就警告你！╭(╯^╰)╮   如果只定义了其中1~2个不会警告
        //正确食用  margin:20px 10px 5px 11px;
        "shorthand":true,
        //text-indent不能使用负值  除非同属性direction:ltr一起出现
        "text-indent":false,
        //h1-h6 只应该被定义一次   伪类不算
        "unique-headings":false,
        //若*选择器 是key选择器的话(最右边那个) 警告
        "universal-selector":false,
        //类似于[type=text]的选择器作为key选择器的时候  浏览器会先把所有的节点匹配  然后去检查他们的type属性会降低效率
        "unqualified-attributes":false,
        //不能只有前缀属性，没有通用属性  -moz-border-radius  并且通用属性必须在最后
        "vendor-prefix":false,
        //不允许 0px  0% 0em
        "zero-units":true,
		//自定义的规则
		//opacity属性需要做兼容性处理
		"opacity":false
    },
    "jsCheckOptions": {
        "anon" : true , //匿名函数声明中function关键字与()之间的空白可以被省略
        "bitwise" : true , //允许按位运算
        "browser" : true , //浏览器(标准)是预定义的全局
        "cap" : false , //允许大写的HTML
        "continue" : false , //容忍continuation语句
        "css" : false,  //允许检查CSS
        "debug" : false,  //允许debuger语句
        "devel" : false , //允许控制台语句console、alert语句
        "eqeq" : true  ,//允许==和!=运算符
        "es5" : true  ,//允许ECMAScript 5 的语法
        "eval" : false  ,//允许使用eval
        "forin" : true  ,//for in声明的中的key不需要使用hasOwnProperty过滤
        "fragment" : false,  //允许检查HTML片段
        "maxerr" :  50,//允许做大的错误数，默认是50
        "maxlen" : 200,//允许单行的最大长度
        "newcap" : true,  //构造函数的首字母大小写可以被忽略
        "node" : false  ,//node.js是预定义的全局
        "nomen" : true , //允许标识符以_开头
        "on" : false  ,//允许在HTML使用类似onclick这样的事件处理
        "passfail" : false,  //应该在扫描到第一个错误时停止
        "plusplus" : true , //允许++递增 或 --递减
        "properties" : false,  //由于 JavaScript 是松散类型、动态对象的语言，在编译时不可能确定，如果希望检查属性名称拼写，所有内置的属性名称必须写在 /*properties*/中
        "regexp" : true , //允许正则表达式文本中含有.
        "rhino" : false , //假设是在rhino环境中
        "undef" : false , //变量的定义顺序可以是混乱的，比如var a = b.name, b = {name: "b"};
        "unparam" : false,  //允许忽略未使用的参数
        "sloppy" : true , //'use strict'标注是可选的
        "sub" : false , //容忍所有的下标表示法，如果属性名是一个合法的标识符，建议用.表示法
        "vars" : false , //允许每个函数有多个var声明
        "white" : true , //容忍多余的空白
        "widget" : false , //假设是在Yahoo Widgets环境中
        "windows" : false , //MS Windows的特定全局应该是预定义的
        "this":true
    },
    "errorLogPath": "./errorLog"
	};

	module.exports = options;

#开发及扩展  
npm install 安装的是压缩版本  
开发版本请到[github](https://github.com/Zhuyi731/reasy-htmlcss-hint-node.git)下载  
下载至本地git clone https://github.com/Zhuyi731/reasy-htmlcss-hint-node.git   

##目录结构
	  
	│  
	├─compressed          //压缩后的代码，用于发布
	│  
	├─reasy-htmlcss-hint-node   //开发时的代码
	│  └─code
	│
	├─gulpfile.js    //gulp相关配置文件