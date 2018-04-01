var random = Math.random();
seajs.config({
	map: [
		//防止js文件夹下的文件被缓存
		[/(.*js\/[^\/\.]*\.(?:js))(?:.*)/, '$1?' + "t=" + random]
	]
});


function MainLogic() {
	var that = this;
	this.init = function () {
		$("body").addClass("index-body");
		this.initHtml();
		this.initEvent();
		that.getValue();
		this.initModuleHeight();
	
		var requestTimer = setInterval(function(){//检测是否有新版本
			$.get("goform/hasNewVersion",function(res){
				// res = res.replace(/\\n/g,"<br>");
				res = JSON.parse(res);
				if(res.hasNewVersion == "1"){
					that.onlineUpgrade.showModal();
					that.onlineUpgrade.hasNewVersion(res);
					clearInterval(requestTimer);//收到了就不在发请求了 节约资源
				}
			});	
		},2000);//每隔2.5s发送一次   因为后台第一次请求的数据是不正确的
		
		var IPconflictTimer = setInterval(function(){//检测是否IP冲突
			$.get("goform/isIPConflict",function(res){
				res = JSON.parse(res);
				if (res.status == "1") {
					$("#conflictIPMsg").html("<p>" + _("Para corrigir esse conflito, o endereço IP da LAN será alterado para %s.", [res.ip]) + "</p><p>" + _("A partir de agora, para acessar as configurações do IWR 3001, utilize o endereço http://%s ou http://meuintelbras.local.", [res.ip]) + "</p>")
					$(".conflict").removeClass("none");
					clearInterval(IPconflictTimer);
				}
			});
		}, 2000);

		//检测是否配置了管理员密码
		$.get("goform/getAdminPassword",function(res){
			res = JSON.parse(res);
			if(res.status == "1"){
				$(".admin-password-wrap").removeClass("none");	
			}
		});



	};

	this.initHtml = function () {
		$("#adminPassword").removeValidateTipError(true);
	 	// $("#adminPassword").addPlaceholder("Somente letras e números");
	};
	/*
	*	这个东西呢 是用来处理在线升级模态框的逻辑的 --#  @edit by zhy 17/9/13
	*   通过onlineUpgrade.showModal()的方式调用
	*/ 
	function onlineUpgrade(){
		var online = this;
			this.showModal = function(){//展现模态框
				$(".backWrap,.detect").removeClass("none");
				$(".wrap-content,.wrap-footer,.downloading").addClass("none");
			};
			this.detecting = function(){//检测中
				$(".detecting").removeClass("none");
				$(".noNewVersion").addClass("none");
			};
			this.noNewVersion = function(){//没有新版本
				$(".detecting").addClass("none");
				$(".noNewVersion").removeClass("none");
			};
			this.hasNewVersion = function(res){//有新版本的情况
				$("#newVersion").children("span").html(res.version);
				$("#changeLog textarea").val(res.changeLog);
				$(".wrap-content,.wrap-footer").removeClass("none");
				$(".detect,.downloading").addClass("none");
			};
			this.closeModal = function(){//关闭模态框
				if($("#dontRemind")[0].checked){
					$.get("goform/noRemind");//不在提醒
				}
				$(".detect,.backWrap").addClass("none");
				$(".wrap-content,.wrap-footer,.downloading").removeClass("none");
			};
			this.upgrade = function(){//点击立即升级按钮
				online.downloading();
				online.forbidQuit(0);//只有当下载失败时才允许退出
				var err = {
					"100":_("Download file failed"),
					"101":_("Memory is not enough"),
					"102":_("MD5 error"),
					"200":_("Upgrading"),
					"201":_("Upgrade success"),
					"202":_("Upgrade failed"),
					"203":_("Downloading")
				};
				$.get("goform/onlineUpgrade?random="+Math.random());
			var status = null,
				timer;
			var aaa = {};
			timer = setInterval(function () {
				$.get("goform/getUpgradeStatus?random=" + Math.random(), aaa, function (res) {
					res = JSON.parse(res);
					if (status != res.status) { //状态改变才做相应操作
						if (res.status == "-1") { //-1 升级失败  0 下载中 1 升级中
							if (err[res.errorCode]) {
								alert(err[res.errorCode]);
							} else {
								alert(_("Unknow error"));
							}
							clearInterval(timer);
							online.forbidQuit(1); //重新绑定一下
							online.closeModal();
						} else if (res.status == "0") {} else if (res.status == "1") { //1  升级中
							online.upgrading(50000); //25s
							clearInterval(timer); //处于升级中也可以关闭了  因为升级时间是固定的
						} else { //2 升级完成
							clearInterval(timer);
						}
					}
				});
			}, 500); //0.5s请求1次
		};
		this.downloading = function () { //显示下载页面
			$(".downloading").removeClass("none");
			$(".wrap-content,.wrap-footer,.detect").addClass("none");
		};
		this.forbidQuit = function (act) { //阻止在升级时点x  0 为阻止 1为允许
			if (act) {
				$(".closeModal").css("display", "block");
			} else {
				$(".closeModal").css("display", "none");
			}
		};
		this.upgrading = function (time) { //显示升级页面    time为进度条总时间 不能少于10000ms即10s

				$(".upgrading").removeClass("none");
				$(".downloading-content").addClass("none");
				var flag = 0,//0 升级 1重启 2重启中 
					per = Math.floor(time/20000),//时间与计数器的比值
					timer = null,//定时器
					barLength = 0,//进度条长度
					totalLength = document.getElementById("gray-bar").offsetWidth - 2,//减去border宽					
					ct = 0,//计数器
					refresh = false;//状态是否更新  减少重复赋值
					// if (!!window.ActiveXObject || "ActiveXObject" in window){//IE
					// 	// totalLength = $(".gray-bar")[0].currentStyle.getAttribute("width");
					// 	totalLength = document.getElementById("gray-bar").offsetWidth;
					// }else{
					// 	totalLength = window.getComputedStyle($(".gray-bar")[0]).width;
					// }
					// totalLength = totalLength.substr(0,3);//默认3位数宽度  去掉px
				timer = setInterval(function(){
					ct++;
					(ct % per == 0) && barLength++ && (refresh=!refresh);//当且仅当状态需要更新才执行
					if(flag == 0){
						if(barLength > 100){//升级完成
							barLength = 0;
							ct = 0;
							flag=1;
							$(".progress-upgrade").find("span").eq(0).html(_("Upgrading success, rebooting"));
							$(".progress-upgrade").find("span").eq(1).html(barLength);
							$(".progress-upgrade").find("h1").html(_("system booting"));
							$(".progress-upgrade").find("img").attr("src","./img/loading1.gif");
							$(".black-bar").css("width",0);
						}else{
							if(refresh){
								$(".progress-upgrade").find("span").eq(1).html(barLength);
								$(".black-bar").css("width",Math.ceil(barLength*totalLength/100)+"px");
							}
						}
						refresh = false;
					}else{
						if(barLength > 100){//重启完成
							clearInterval(timer);
							window.location.href="/login.html";
						}else{
							if(refresh){
								$(".progress-upgrade").find("span").eq(1).html(barLength);
								$(".black-bar").css("width",Math.ceil(barLength*totalLength/100)+"px");
							}
						}
						refresh = false;
					}	
				},100);//以100ms为基准刷新
			};
	}
	this.onlineUpgrade = new onlineUpgrade();
	function changeLocation() {
		if ($(this).hasClass("icon-weibo")) {  //中国的才会有
		} else if ($(this).hasClass("icon-wechat")) {
			$("#weixinWrap").show();
			$(this).attr("href", "javascript:void(0)");
		} else if ($(this).hasClass("icon-facebook")) {} else if ($(this).hasClass("icon-twitter")) {}
	}

	function changeIcon(lang) {
		$("#nav-footer-icon-cn, #nav-footer-icon-multi").addClass("none");
		if (lang == "cn") {
			$("#nav-footer-icon-cn").removeClass("none");

			$('.brand').attr('href', 'http://meuintelbras.local');
		} else {
			$("#nav-footer-icon-multi").removeClass("none");
			$('.brand').attr('href', 'http://meuintelbras.local');
		}
	}

	this.initEvent = function () {
		var clickTag = "click";
		$("#nav-menu").delegate("li", "click", function () {
			var targetMenu = this.children[0].id || "status";
			that.changeMenu(targetMenu);
		});
		//在线升级
		var upgrade = new onlineUpgrade();
		$(".btn-upgrade").on("click",upgrade.upgrade);
		$(".closeModal").on("click",upgrade.closeModal);
		//IP冲突
		$(".closeConflictModal").on("click",function(){
			$(".conflict").addClass("none");
		});
		$("#jump").on("click",function(){
			$.get("goform/conflictSolve",function(res){
			$(".conflict").addClass("none");
				res = JSON.parse(res);
				progressLogic.init("", "reboot", 280, res.ip);
			});
		});

		$("#closeAdminModal,#passwordCancel").on("click",function(){
			$(".admin-password-wrap").addClass("none");
		});
		
		//set administrator password
		$("#passwordSet").on("click",function(){
			if($("#adminPassword").parent().hasClass("has-error")){
				$("#adminPassword").focus();
			}else{
				var encode = new Encode();
				mainLogic.showModuleMsg(_("Saving..."));
				var pwd = $("#adminPassword").val();
				pwd = encode(pwd);
				$.get("goform/setAdminPassword?password="+pwd,function(err){
					 $('#form-massage').fadeOut(700);
					 setTimeout(function(){
					 	$(".admin-password-wrap").addClass("none");
					 },	700);

					window.location.href = "/login.html";
					
				});
			}
		});

		if (window.ontouchstart) { //当某些手机浏览器不支持click事件
			clickTag = "touch";
		}

		$(document).delegate("*", "click", function (e) {
			var target = e.target || e.srcElement,
				clickSetLang;
			if ($(target.parentNode).hasClass('addLang') || $(target.parentNode).attr('id') === "navbar-button") {
				target = target.parentNode;
			}
			if ($(target).attr('id') != "navbar-button") {
				if ($(target).attr('id') != "nav-menu") {
					if (!$(".navbar-toggle").hasClass("none") && $("#nav-menu").hasClass("nav-menu-push")) {
						$("#nav-menu").removeClass("nav-menu-push");
					}
				}
			}


			if ($(target).hasClass("addLang")) {
				clickSetLang = true;
			}

			if (clickSetLang) {
				//$("#selectLang .dropdown-menu").show();
			} else {
				$("#selectLang .dropdown-menu").hide();
			}

		});

		$("#selectLang .addLang").on("click", function () {
			if ($.isHidden($("#selectLang .dropdown-menu")[0])) {
				$("#selectLang .dropdown-menu").show();
			} else {
				$("#selectLang .dropdown-menu").hide();
			}
		});

		//for foreign version
		//$("#nav-footer-icon").delegate(".nav-icon", "mouseover", changeLocation);
		//$("#nav-footer-icon").delegate(".weixin", "mouseout", function () {
		//$("#weixinWrap").hide();
		//});

		$("#selectLang .dropdown-menu li").on("click", function () {
			var lang = $(this).attr("data-val");
			$("#selectLang .dropdown-menu").hide();
			B.setLang(lang);
			window.location.reload(true);
			$("#selectLang .lang").html(B.langArr[lang]);
			changeIcon(lang);
		});

		$(window).resize(this.initModuleHeight);

		$('#submit').on('click', function () {
			that.modules.validate.checkAll();
			$('#submit')[0].blur();
		});

		$("#navbar-button").on("click", function () {
			if (!$("#nav-menu").hasClass("nav-menu-push")) {
				$("#nav-menu").addClass("nav-menu-push");
			} else {
				$("#nav-menu").removeClass("nav-menu-push");
			}
		});

		//Cancel
		$('#cancel').on('click', function () {
			that.modules.reCancel();
		});

		$("#loginout").on("click", function () {
			$.post("goform/loginOut", "action=loginout", function () {
				window.location.href = "./login.html";
				//window.location.reload(true);
			});
		});
	};


	this.getValue = function () {
		var modules = "loginAuth,wifiRelay";
		$.getJSON("goform/getHomePageInfo?" + getRandom() + "&modules=" + encodeURIComponent(modules), function (obj) {
			if (obj.loginAuth.hasLoginPwd == "true") {
				$("#loginout").show();
			} else {
				$("#loginout").hide();
			}

			var wifiRelayObj = obj.wifiRelay,
				fistMenu = "status";
			if (wifiRelayObj.wifiRelayType == "client+ap") {
				$("#netCtrNavWrap").remove();
			}

			if (wifiRelayObj.wifiRelayType == "ap") {
				fistMenu = "wireless"; //在AP模式下没有系统状态，家长控制等
				$(".routerMode").remove();
			} else {
				$("#userManageWrap").remove();
			}
			that.changeMenu(fistMenu);

		});


	};
	//切换菜单栏
	this.changeMenu = function (id) {
		var nextUrl = id,
			mainHtml;
		$("#iframe").addClass("none");
		$("#iframe").load("./" + nextUrl + ".html?" + random, function () {
			if ($("#iframe").find("meta").length > 0) {
				top.location.reload(true);
				return;
			}

			if (id == "status") {
				$("#submit").addClass("none");
				$("#cancel").addClass("none");
			} else {
				$("#submit").removeClass("none");
				$("#cancel").removeClass("none");
			}

			seajs.use("./js/" + nextUrl, function (modules) { //加载模块所需函数
				//翻译
				B.translatePage();
				$("#iframe").removeClass("none");
				modules.init(); //模块初始化
				if (that.modules && that.modules != modules) { //判断前一个模块是否是当前模块
					if (typeof that.modules.upgradeLoad == "object") { //解决ajaxupload 影响高度问题
						//if (that.modules.upgradeLoad._input == "object") {
						$("[name='upgradeFile']").parent().remove();
						//}
					}

					//模块切换之后，修改模块运行标志
					that.modules.pageRunning = false;
					$.validate.utils.errorNum = 0; //切换页面时清空数据验证错误
				}
				that.modules = modules; //保留当前运行模块
				that.initModuleHeight();
			});
		});
		$("#nav-menu").removeClass("nav-menu-push");
		$("li>.active").removeClass("active");
		$("#" + id).addClass("active");

	};
	this.initModuleHeight = function () {
		var viewHeight = $.viewportHeight(),
			menuHeight = $("#sub-menu").height(),
			mainHeight = $("#iframe").height(),
			height,
			minHeight;
		minHeight = Math.max(menuHeight, mainHeight);
		if (minHeight < (viewHeight - 110)) {
			$("#nav-menu").css('min-height', minHeight + "px");
			$("#main-content").css('min-height', minHeight + "px");
		} else {
			$("#nav-menu").css('min-height', minHeight + 40 + "px");
			$("#main-content").css('min-height', minHeight + 40 + "px");
		}

		height = mainHeight;
		if (height >= viewHeight - 110) {
			height = height - 110;
		} else {
			height = viewHeight - 110;
		}

		if (minHeight > height) {
			height = minHeight;
		}

		$("#nav-menu").css('height', height + 40 + "px");
		$("#main-content").css('height', height + 30 + "px");
	};

	this.showMsgTimer = null;

	this.showModuleMsg = function (text, showTime) {
		var msgBox = $('#form-massage'),
			time;
		msgBox.html(text).fadeIn(10);

		clearTimeout(that.showMsgTimer);
		//0 表示不消失
		if (showTime != 0) {
			time = showTime || 2000;
			that.showMsgTimer = setTimeout(function () {
				msgBox.fadeOut(700);
			}, time);
		}
	}
}

function ProgressLogic() {
	var that = this;
	var pc = 0;
	this.type = null;
	this.time = null;
	this.upgradeTime = null;
	this.rebootTime = null;
	var ip;
	this.init = function (str, type, rebootTime, hostip) {
		ip = hostip || "";
		$("#progress-dialog").css("display", "block");
		$("#progress-overlay").addClass("in");
		$("#form-massage").fadeOut(0);
		this.type = type;
		this.time = rebootTime || 200;
		var rebootMsg = str || _("Rebooting...Please wait...");
		$("#rebootWrap").find("p").html(rebootMsg);
		if (type != "upgrade") {
			$("#upgradeWrap").addClass("none");
			this.reboot();
		} else {
			this.upgrade();
		}

	};
	this.reboot = function () {
		that.rebootTime = setTimeout(function () {
			that.reboot();
			pc++;
		}, that.time);
		if (pc > 100) {
			clearTimeout(that.upgradeTime);
			clearTimeout(that.rebootTime);
			if (ip) {
				window.location.href = "http://" + ip;
			} else {
				window.location.reload(true);
			}
			return;
		}
		$("#rebootWrap").find(".progress-bar").css("width", pc + "%");
		$("#rebootWrap").find("span").html(pc + "%");
	};
	this.upgrade = function () {
		that.upgradeTime = setTimeout(function () {
			that.upgrade();
			pc++;
		}, 200);
		if (pc > 100) {
			clearTimeout(that.upgradeTime);
			pc = 0;
			that.reboot();
			return;
		}
		$("#upgradeWrap").find(".progress-bar").css("width", pc + "%");
		$("#upgradeWrap").find("span").html(pc + "%");
	}
}

$(function () {
	$("#main_content").show();
	var mainLogic = new MainLogic();
	window.mainLogic = mainLogic;
	mainLogic.init();
	var progressLogic = new ProgressLogic();
	window.progressLogic = progressLogic;
	var pagelogic = new PageLogic();
	pagelogic.addValidate();
})