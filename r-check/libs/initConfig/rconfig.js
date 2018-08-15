var options = {
    "htmlCheckOptions": {
        //标签名 小写 
        "tagname-lowercase": true,
        //属性名称小写 
        "attr-lowercase": true,
        //属性值使用双引号     
        "attr-value-double-quotes": true,
        //属性值不能重定义     
        "attr-no-duplication": true,
        //标签配对     
        "tag-pair": true,
        //标签自闭     
        "tag-self-close": false,
        //id唯一 
        "id-unique": true,
        //src非空 
        "src-not-empty": true,
        //自定义规则 
        //检查IE 头部是否加入meta进行兼容 
        "IE-meta": true,
        //检测是否处理placeholder的兼容
        "placeholder": true,
        //<!DOCTYPE>检查 
        "doctype-html5": true,
        //title必须     
        "title-require": false,
        //alt必须     
        "alt-require": false,
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
        //属性值不能为空     
        "attr-value-not-empty": false,
        //html标签在头部     
        "doctype-first": false
    },
    //英文原文文档 
    //https://github.com/CSSLint/csslint/wiki/ 
    "cssCheckOptions": {
        //重复属性检测 
        "duplicate-properties": true,
        //display与一些其他值不能同时使用   
        //如 inline 不能与height同时使用   block不能使用 vertical-align   table-*不能使用float 
        "display-property-grouping": true,
        //不允许使用重复的背景图片   如果是精灵图  背景图在一个公共的类里引用 其他类用于调整位置 
        "duplicate-background-images": true,
        //gradient 这种需要跨浏览器兼容的属性应该写在一起  避免漏改 
        "gradients": true,
        //rgba  hsl  hsla这种类型的颜色会提出警告 
        "fallback-colors": true,
        //不允许导入css  @import url(more.css); 
        "import": true,
        //如果你把 margin的top bottom left right都定义一遍就警告你！╭(╯^╰)╮   如果只定义了其中1~2个不会警告 
        //正确使用  margin:20px 10px 5px 11px; 
        "shorthand": true,
        //不允许 0px  0% 0em 
        "zero-units": true,
        //自定义的规则 
        //不能只有前缀属性，没有通用属性  -moz-border-radius  并且通用属性必须在最后 
        //TODO false->true by pjl
        "vendor-prefix": true,
        //是否检测 !important 
        "important": false,
        //是否允许 .bar.foo 这种两个连在一起的选择器 
        "adjoining-classes": false,
        //未知属性检测 
        "known-properties": false,
        //border-box 和 box-sizing检测 
        "box-sizing": false,
        //width、height 与 border  padding值一起使用时 发出警告 
        "box-model": false,
        //font-size的声明不应该超过10条   
        "font-sizes": false,
        //@font-face  这种外部字体规则不要引入太多 
        "font-faces": false,
        //float条数超过10条时，警告 
        "floats": false,
        //以*开头的属性检测    如  *width  检测到会报错 
        "star-property-hack": false,
        //以_开头的属性检测 
        "underscore-property-hack": false,
        //若有  outline:0 或 outline:none的情况并且选择器没有:focus伪类  警告    
        //或者选择器有:focus伪类 但是只有outline一条属性 警告 
        "outline-none": false,
        //id选择器不要放在头部  例如  #head a{}这种  应该单独使用  因为css解析从右向左解析，这样反而降低了效率 
        "ids": false,
        //h1-h6应该在头部定义 而不能再子类中再次定义 例如.box h3 {font-weight: normal;}是不行的 
        //.item:hover h3 { font-weight: bold; } 也是不行的    正确的是  h3{font-weight:normal} 
        "qualified-headings": false,
        //text-indent不能使用负值  除非同属性direction:ltr一起出现 
        "text-indent": false,
        //h1-h6 只应该被定义一次   伪类不算 
        "unique-headings": false,
        //若*选择器 是key选择器的话(最右边那个) 警告 
        "universal-selector": false,
        //类似于[type=text]的选择器作为key选择器的时候  浏览器会先把所有的节点匹配  然后去检查他们的type属性会降低效率 
        "unqualified-attributes": false
    },
    "jsonAndCode": { //检查源码中每条翻译是否在json中都由对应的词条
        "jsonPath": "./app/common/lang", //***必填   json文件的上级目录的上级目录   因为可能有多国语言的情况
        "codePath": "./", //***必填  代码的路径，如果就是本地  输入./即可
        "logPath": "./errorLog" //***选填  错误日志的路径，不填默认为 ./errorLog
    },
    "jsonAndExcel": { //检查json文件和excel文件的词条是否一一对应
        "jsonPath": "./app/common/lang", //***必填   json文件的上级目录的上级目录   因为可能有多国语言的情况
        "excelPath": "./ci_excel/lang.xlsx", //***必填   语言包的路径
        "logPath": "./errorLog", //***选填   错误日志的路径，不填默认为 ./errorLog
        "defaultLang": "en" //***必填   默认的语言，excel文件中以这种语言为基准
    },
    "checkDuplicate": { //检查excel中是否有重复的词条。重复词条会导致翻译的一对多问题
        "excelPath": "./ci_excel/lang.xlsx", //***必填   语言包的路径、
        "defaultLang": "en", //***必填   默认的语言，excel文件中以这种语言为基准
        "logPath": "./errorLog" //***选填   错误日志的路径，不填默认为 ./errorLo
    },
    "errorLogPath": "./errorLog", //错误日志存放的文件夹
    "exclude": /(node_modules|goform|reasy|reasy-ui)/g //不检查的文件夹 
};
module.exports = options;