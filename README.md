# r-check

![](https://img.shields.io/npm/v/r-check.svg?style=flat)
![](https://img.shields.io/npm/dt/r-check.svg)
![](https://img.shields.io/npm/l/r-check.svg)

> r-check是腾达公司Web组reasy-team用于组内检查及开发的一个工具。并可以通过子进程调用给web组CI服务器调用，用于检查代码规范。[CI服务器详情请点击此处](https://github.com/Zhuyi731/Tenda_CI_server)  

# 目的  
项目开发痛点:  
>1. 项目开发中，经常会遇到一些基础的低级错误,而这些错误是可以通过编辑器的各种Lint来避免的(然而组内每个人的配置都不尽相同，并且有些人不会去配置Lint)。
>2. 组内代码风格不一致,可以通过Lint来控制
>3. 因公司项目实际情况，翻译由前端完成，在多国语言项目上往往会出现许多问题,而这些问题都是可以通过脚本来检测出来的。  

r-check 工具作为组内CI服务器的底层检查工具，既可本地使用，也可以交由服务器通过Child_Process调用。
 
r-check 工具集成了如下功能
- 语法规范检查
- js语法规范错误修复
- 翻译检查  
- 编码格式检查  
- OEM产品本地自动化开发

1.语法规范扩展于htmlHint、csslint以及ESLint    
2.翻译检查主要检查： 

- 代码中的词条是否都在语言包中  
- 代码中是否存在中文这种没有翻译的词条  
- 检查语言包json文件与资料部给出的excel文件是否一一对应  
- 检查资料部给出的excel文件是否有重复词条(一对多的情况)  

3.编码格式检查主要检查所有文件格式是否为UTF-8格式(有无BOM均可)。来避免因为编码异常改变导致的错误。  

4.修复由eslint检查出来的错误
  
5.开发了一个OEM自动开发的工具挂在CI服务器上，然而其本地开发不是很方便，所以需要一个本地的开发环境(TODO:@4.0.0)  


# 安装
1. npm install r-check -g (记得加入-g命令全局安装，安装时会自动生成r-check.cmd脚本文件)  
2. 下载完成后输入r-check -V（大写）来检查是否安装成功    
3. 进入需要检查的项目根目录  
4. 在cmd窗口运行*r-check init*根据步骤生成配置文件(也可以通过*r-check init -y*生成*默认配置*文件)
5. 生成配置文件后,在cmd窗口运行r-check run根据步骤选择即可检查
6. 或者通过r-check run -Q -x -x (x为配置参数) 配置参数具体用法参考[CLI参数](#CLI参数)   
7. 检查之后会在根目录生成一个Error_Report.html文件，可视化的展示错误报告(后面会添加图表及项目错误趋势报告)。  
 


# 项目目录结构

	r-check:   
	├─dev-csslint							//开发版csslint
	├─dev-htmlhint							//开发版htmlhint
	└─r-check							//npm 包发布的路径
		├─bin							//cli界面的配置
		├─common						//公共工具
		├─custom-csslint					//开发版csslint编译后的版本
		├─custom-htmlhint					//开发版htmlhint编译后的版本
		└─libs							//核心内容
			├─baseClass					//验证器与控制器基类。
			├─code-check					//编码规范检查
			│  ├─CssValidator				//css检查器
			│  ├─HtmlValidator				//html检查器
			│  └─JsValidator				//js检查器
			├─encode-check					//编码检查
			│  └─EncodeValidator				//编码检查器
			├─generator					//错误报告生成器
			├─initConfig					//配置文件及生成工具
			├─oem-dev-tool					//本地OEM开发工具
			└─translate-check				//翻译检查
				├─checkDuplicate		
				├─jsonAndCode
				├─jsonAndExcel
				└─utils

## 配置文件生成
使用r-check init 指令  
然后根据提示即可生成配置文件  
可选参数:-y 生成默认配置文件(生成3个配置文件)  
-o 老代码配置文件(配置-y才可用)
  
配置文件共三个：

- r.config.js
- .eslintrc.js
- .eslintignore

这三个文件的作用  

- r.config.js:用于配置翻译检查的参数以及html、css语法规范的检查配置。  
- .eslintrc.js:用于配置ESLint插件的语法规范检查规则(组内统一)。此规则同时也将应用于你的IDE（如果你装了ESLint插件的话）  
- .eslintignore:用于配置ESLint应该忽略的文件(比如node_modules)  

输入r-check init按步骤选择即可  
1. 第一步会提示生成的配置文件类型，有三种：生成所有配置文件 && 仅生成ESLint相关配置文件 && 仅生成r.config.js  
2. 第二步需要使用者选择是否为老代码，因为很多老代码不是SPA，没有经过打包，会有许多错误。如果不是老代码直接回车，默认为否。  
3. 如果配置文件已经存在于当前目录中，则会询问是否覆盖配置文件。选择是，则会覆盖所有配置文件。选择否，则不会覆盖配置文件，但没有的配置文件仍会生成。


## CLI参数 
使用r-check -v 查看版本号(当前版本@1.2.5)  
使用r-check -h 可以查看帮助信息  
运行r-check run检查目录下编码规范及翻译检查。 
运行r-check init生成配置文件
运行r-check fix修复eslint检查出来的基础错误   

###检查参数
检查参数是为了让使用者进行快速的配置，而不用一步步选择。  
参数用法r-check run -<参数>  
帮助信息显示如下  

	Hello r-check
	Current Vertion:2.0.0
	
	
	Usage: run [options]
	
	check your folder with different options.
	
	Options:  
	
		-S, --close-check             Close source code check.
		-C, --close-css               Close css check.
		-H, --close-html              Close html check.
		-J, --close-js                Close js check.
		-E, --close-encode            Close encode check.
		-T, --check-translate         Open translate check.
		-M, --multifile               Output the results as a single log for each file checked
		-Q, --question                Run immidiately without config any options
		-h, --help                    output usage information

当使用r-check run -Q时，CLI中就不会出现询问配置的显示。而是根据-Q后的参数直接运行  
	
	e.g:  
	r-check run -QSJ //这样配置的话呢，就会关闭代码规范检查，开启翻译检查。
	r-check run -QHCE //这样配置的话，就会关闭html检查css检查编码检查，从而只检查js

下面有更加详细的介绍
# r-check **&lt;options&gt;** 
r-check指令后可以跟上一些选项来选择关闭某些检查  

### -M or --multifile  配置输出日志的格式  
>  输出的错误日志默认是单个文件的形式，保存在各自的文件夹下。
>  如果你偏好每个错误日志对应其错误的文件，请使用-M参数

e.g:
>  r-check run -QM

### -S or --close-check 关闭代码规范检查  
>  输入此指令后将不会检查代码规范    
>  包括html,css,js代码规范   

e.g:
>  r-check run -QS 

或者  

>  r-check --close-check

### -C or--close-css关闭css检查  
### -H or --close-html关闭html检查  
### -J or --close-js关闭js检查     
**注意：**所有的短指令是可以组合起来的  但是长指令不可以  
e.g:
>  例如 r-check -QCHJ

等价于

>  r-check -Q -C -H -J

等价于

>  r-check -Q --close-css --close-html --close-js  


### -E or --close-encode **关闭编码检查**  
编码检查会检查你的文件是否为UTF-8格式(有无BOM均可，但必须是UTF8)。  
以避免在前后台在编码格式上出现错误，以及在IE8下的显示问题。    
编码检查虽然是必须的，但是编码检查会进行大量的IO操作，建议检查一次确认没有问题之后手动关闭。  
e.g:  
>  r-check run -E

### -T or --check-translate **开启翻译检查**  
因为不一定所有的产品需要翻译检查。  
当开启翻译检查却没有检查到语言包或者翻译检查的相关配置项时会报错。   
翻译检查的配置在r.config.js中配置。  
具体配置项如下:  

    //配置项中有重复的项是为了配置方便，避免出现混淆。请在每个检查下都配置一遍  
    module.exports = {
      "jsonAndCode": { //检查源码中每条翻译是否在json中都由对应的词条
         "jsonPath": "./app/common/lang"     //***必填   json文件的上级目录的上级目录   因为可能有多国语言的情况
        
       },
      "jsonAndExcel": { //检查json文件和excel文件的词条是否一一对应
         "jsonPath": "./app/common/lang", //***必填   json文件的上级目录的上级目录   因为可能有多国语言的情况
         "excelPath": "./docs/O3.xlsx",   //***必填   语言包的路径
         "defaultLang": "en"             //***必填   默认的语言，excel文件中以这种语言为基准
       
       },
      "checkDuplicate": { //检查excel中是否有重复的词条。重复词条会导致翻译的一对多问题
         "excelPath": "./test/O3.xlsx", //***必填   语言包的路径、
         "defaultLang": "en"           //***必填   默认的语言，excel文件中以这种语言为基准
       }
    };



## 配置文件  
配置文件包含四个部分  
- HTML语法检查规则  
- CSS语法检查规则 
- 翻译检查配置 
- 错误日志路径  

配置文件详细使用请参照[配置文件规则Wiki](https://github.com/Zhuyi731/r-check/wiki/Config-Files-Detail "配置文件规则Wiki")

	

# 开发及扩展  
搭配CI使用，请参照[Tenda web组 CI服务器](https://github.com/Zhuyi731/Tenda_CI_server)

npm install 安装的是发布版本  
开发版本请到[github](https://github.com/Zhuyi731/r-check.git)下载 
 
或者使用git bash下载至本地  
git clone https://github.com/Zhuyi731/r-check.git   

