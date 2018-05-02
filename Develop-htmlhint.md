#HTMLHint 开发
HTMLHint git reposity [https://github.com/yaniswang/HTMLHint](https://github.com/yaniswang/HTMLHint)  
因为组内的HTMLHint已经加入了自定义规则  
如果想要继续添加规则，请在dev-htmlhint目录下开发  
具体怎么添加新规则请往下看。  


#HTMLHint 目录结构  

	HTMLHint  
	├─bin   //二进制文件,用于生成HTMLHint.cmd  并解析输入的配置参数    
	├─lib   //grunt编译后的最终文件所在地  
	├─src  //自定义的csslint插件  
	│  ├─rules    //所有的规则，自定义规则需要再这里添加  
	│  ├─core.js  //入口
	│  ├─htmlparser.js   //用于解析html代码的。这部分代码非常值得学习
	│  └─reporter.js     //一个小工具
	├─test               //用mocha和断言库来测试自己写的规则是否正确的地方  
	│  ├─html
	│  ├─rules           //用于测试每条规则的正确性
	│  ├─core.spec.js    //测试整体的正确性
	│  ├─executable.spec.js 
	│  └─htmlparse.spec.js 
	├─index.js          //暴露给npm的接口，与我们开发无关  
	└─gruntfile.js      //grunt配置文件     grunt配了3个任务，分别是 grunt watch || grunt build || grunt  开发的时候用grunt watch就行，发布的时候用grunt build  


#项目整体逻辑  
项目的入口文件为core.js  
该文件暴露了一个HTMLHint对象  
HTMLHint有几个比较重要的方法  
1. addRule(rule)添加对应的验证规则  
2. verify(code) 验证规则  code为html代码  我们在自己的r-check中调用这个方法来验证HTML语法规则  
3. format  错误信息格式化函数  

以及一个比较重要的属性 defaultRuleset，这个属性定义了默认的规则。也就是说你没有显示的配置这些规则为false时，这些规则也是开启的。  

#规则添加
rules每个文件对应一条规则，每个文件中都调用HTMLHint.addRule这个方法来创建规则  
addRule接受一个对象，  
对象中有两个属性id，description对应配置中的ID以及出现错误时的描述 

###init函数 
对象中需要传入init函数，init接受两个参数(parse,reporter);
reporter是用来输出错误信息的：  
有reporter.error("错误信息")  
  repoter.warn("警告信息")
  reporter.info("正常信息")  

> parser为HTMLParser的实例，该实例在添加规则时有如下方法可以调用 ： 
  addListener && removeListener  
  addListener可以监听解析html文件时的一些事件

##addListener
addListener(事件类型,回调函数)
  
###事件类型 == tagstart
addListener("tagstart"，callback);

> 当解析器遇到开始标签时触发该事件并调用callback函数   
> 注意：所有的标签开始都会触发这个事件  
> 例如：html为 
> `<div class="fucku"><p></p></div>`    
> 解析器解析到这里时会连续触发两个tagstart事件  然后再触发两个tagend事件
> callback函数接收一个参数event 这个event包含了当前标签的信息  
> 例如event.tagName //div
> event.attrs[0].name // "class"  
> event.attrs[0].value //fucku

addListener("tagEnd", callback);
>当解析器遇到</tagName>时触发事件
>接收参数event 同tagstart

##removeListener
removeListener(事件类型,回调函数)

removeListener接收两个参数，也就是开始传入addEventListener的两个参数  
当不需要监听事件之后，请移除对应的事件以减少损耗  
> 例如：当你只需要监听<head></head>标签中有没有script脚本。那么当你在tagend事件中解析到head标签时，就应该移除该事件。因为后面的内容属于body了，已经与检测无关；

#测试用例添加 
在添加好规则之后，一定要加入相应的测试用例  
测试用例在test/rules下添加  

以tag-pair这个规则为例  
测试用例在/test/rules/tag-pair.spec.js里  
Code: 

 
	//自己看吧。。。   
	//大概就是 expect(aa).to.be(bb)   如果aa!=bb就报错 
	describe('Rules: '+ruldId, function(){
	
	    it('No end tag should result in an error', function(){
	        var code = '<ul><li></ul><span>';
	        var messages = HTMLHint.verify(code, ruleOptions);
	        expect(messages.length).to.be(2);
	        expect(messages[0].rule.id).to.be(ruldId);
	        expect(messages[0].line).to.be(1);
	        expect(messages[0].col).to.be(9);
	        expect(messages[1].rule.id).to.be(ruldId);
	        expect(messages[1].line).to.be(1);
	        expect(messages[1].col).to.be(20);
	
	        code = '<div></div>\r\n<div>aaa';
	        messages = HTMLHint.verify(code, ruleOptions);
	        expect(messages[0].rule.id).to.be(ruldId);
	        expect(messages[0].line).to.be(2);
	        expect(messages[0].col).to.be(9);
	    });
	
	    it('No start tag should result in an error', function(){
	        var code = '</div>';
	        var messages = HTMLHint.verify(code, ruleOptions);
	        expect(messages.length).to.be(1);
	        expect(messages[0].rule.id).to.be(ruldId);
	        expect(messages[0].line).to.be(1);
	        expect(messages[0].col).to.be(1);
	    });
	
	    it('Tag be paired should not result in an error', function(){
	        var code = '<p>aaa</p>';
	        var messages = HTMLHint.verify(code, ruleOptions);
	        expect(messages.length).to.be(0);
	    });
	
	});

#编译  
开发时 grunt watch  
编译时 grunt build  (这个会压缩)  
grunt (这个不会压缩)