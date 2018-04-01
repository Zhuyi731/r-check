define(function (require, exports, module) {

	var pageModule = new PageLogic({
		getUrl: "goform/getIPV6",
		modules: "ipv6Enable,wan6BasicCfg,lan6Cfg,ipv6Status",
		setUrl: "goform/setIPV6"
	});


	pageModule.modules = [];
	module.exports = pageModule;

	var ipv6En = new Ipv6En();
	pageModule.modules.push(ipv6En);

	function Ipv6En() {
		this.moduleName = "ipv6Enable";
		var that = this;
		this.init = function () {
			this.initEvent();
		};
		this.initValue = function (obj) {
			this.toggleBtn(obj.ipv6En);
		};
		this.initEvent = function () {
			$("#ipv6-btn").on("click", function () {
				that.toggleBtn();
			});
		};

		this.getSubmitData = function () {
			var data = {
				module1: that.moduleName
			};
			if ($('#ipv6-btn').attr("class").indexOf("icon-toggle-on") > -1) {
				data.ipv6En = "true";
			} else {
				data.ipv6En = "false";
			}
			return objToString(data);
		};
		this.toggleBtn = function (order) {
			if (order == undefined) { //点击进来的
				if ($('#ipv6-btn').attr("class").indexOf("icon-toggle-on") > -1) {
					order = "0";
				} else {
					order = "1";
				}
			}
			if (order == "1") {
				$("#ipv6Wrap").removeClass("none");
				$("#ipv6-btn").addClass("icon-toggle-on");
				$("#ipv6-btn").removeClass("icon-toggle-off");
			} else {
				$("#ipv6Wrap").addClass("none");
				$("#ipv6-btn").addClass("icon-toggle-off");
				$("#ipv6-btn").removeClass("icon-toggle-on");
			}
			mainLogic.initModuleHeight();
		};
	}

	//wan6Basic 模块
	var wan6BasicCfgModule = new Wan6BasicCfgModule();
	pageModule.modules.push(wan6BasicCfgModule);

	function Wan6BasicCfgModule() {
		var that = this;
		var data = {};
		this.moduleName = "wan6BasicCfg";
		this.init = function () {
			this.initEvent();
		};
		this.initEvent = function () {
			$("#ipv6WanType").on("change", this.changeWanType);
		};
		this.initValue = function (obj) {
			data = obj;
			$("#ipv6Wan").find("input,select").each(function () {
				$this = $(this);

				if (obj[$this.attr("name")]) {
					$this.val(obj[$this.attr("name")]);
				}
			});
			this.changeWanType();
		};
		this.getSubmitData = function () {
			var select = $("#ipv6WanType").val(),
				data = {
					module2: that.moduleName
				};
			if ($('#ipv6-btn').attr("class").indexOf("icon-toggle-on") > -1) { //ipv6打开时才传数据	
				data.ipv6WanType = select;
				switch (select) { //只传对应模块的值
				case "2":
					$("#pppoeWrap,#checkboxWrap").find("input,select").each(function () {
						$this = $(this);
						if ($this.attr("type") == "checkbox") { //两个单选框处理一下
							if ($this[0].checked) {
								data[$this.attr("name")] = "true";
							} else {
								data[$this.attr("name")] = "false";
							}
						} else {
							data[$this.attr("name")] = $this.val();
						}
					});
					break;
				case "0":
					$("#checkboxWrap").find("input").each(function () {
						$this = $(this);
						if ($this.attr("type") == "checkbox") {
							if ($this[0].checked) {
								data[$this.attr("name")] = "true";
							} else {
								data[$this.attr("name")] = "false";
							}
						} else {
							data[$this.attr("name")] = $this.val();
						}
					});
					break;
				case "1":
					$("#staticWrap").find("input").each(function () {
						$this = $(this);
						data[$this.attr("name")] = $this.val();
					});
					break;
				default:
				}
			}
			return objToString(data);

		};
		this.changeWanType = function () {
			var select = $("#ipv6WanType").val();
			switch (select) {
			case "2":
				$("#pppoeWrap,#checkboxWrap").removeClass("none");
				$("#staticWrap").addClass("none");
				$("#ipv6PPPoeDelegation").attr("name", "ipv6PPPoeDelegation");
				$("#ipv6PPPoeTemporary").attr("name", "ipv6PPPoeTemporary");
				break;
			case "0":
				$("#pppoeWrap,#staticWrap").addClass("none");
				$("#checkboxWrap").removeClass("none");
				$("#ipv6PPPoeDelegation").attr("name", "ipv6DhcpDelegation");
				$("#ipv6PPPoeTemporary").attr("name", "ipv6DhcpTemporary");
				break;
			case "1":
				$("#pppoeWrap,#checkboxWrap").addClass("none");
				$("#staticWrap").removeClass("none");
				break;
			default:
				console.log("error data");
			}
			that.checkboxCheck();
		};
		this.checkboxCheck = function () {
			var wanType = $("#ipv6WanType").val();
			if (wanType == "2") {
				data["ipv6PPPoeDelegation"] == "1" ? $("#ipv6PPPoeDelegation").attr("checked", "true") : $("#ipv6PPPoeDelegation").removeAttr("checked");
				data["ipv6PPPoeTemporary"] == "1" ? $("#ipv6PPPoeTemporary").attr("checked", "true") : $("#ipv6PPPoeTemporary").removeAttr("checked");
			} else if (wanType == "0") {
				data["ipv6DhcpDelegation"] == "1" ? $("#ipv6PPPoeDelegation").attr("checked", "true") : $("#ipv6PPPoeDelegation").removeAttr("checked");
				data["ipv6DhcpTemporary"] == "1" ? $("#ipv6PPPoeTemporary").attr("checked", "true") : $("#ipv6PPPoeTemporary").removeAttr("checked");
			} else { //static

			}
		};


		//两个ipv6地址值是否相等
		this.cmp_v6addr = function (a1, a2) {
			return (a1.replace(/:0+/g, ":") == a2.replace(/:0+/g, ":"))
		};
		
		//数据验证
		this.checkData = function () {
			var ipv6En = $('#ipv6-btn').attr("class").indexOf("icon-toggle-on") > -1;
			var ipv6WanType = $("#ipv6WanType").val();
			var ipv6WanIP = $("[name=ipv6WanIP]").val();
			var ipv6WanGateway = $("[name=ipv6WanGateway]").val();
			var ipv6WanDns1 = $("[name=ipv6WanDns1]").val();
			var ipv6WanDns2 = $("[name=ipv6WanDns2]").val();

			//ipv6功能开启且WAN口设置为静态地址时需要验证关联设置有效性
			if (ipv6En && ipv6WanType == "1") {

				//移植代码，逻辑未明
				var tmp = ipv6WanIP.slice(0, 4).toLowerCase();
				if (ipv6WanIP.slice(0, 2).toLowerCase() == "fe" && (tmp != "fec0" || tmp != "fe80")) {
					_("please input a valid IPv6 Address.");
				}

				if (that.cmp_v6addr(ipv6WanIP, ipv6WanGateway)) {
					return _("IPv6 Address and Default Gateway cannot be the same.");
				}

				//ipv6 dns1地址不与能dns2相同@edit by pjl
				if (that.cmp_v6addr(ipv6WanDns1, ipv6WanDns2)) {
					return _("Secondary DNS and Primary DNS cannot be the same.");
				}
			}

			return;
		};

	}

	//lan Configure 模块 
	var lan6CfgModule = new Lan6CfgModule();
	pageModule.modules.push(lan6CfgModule);

	function Lan6CfgModule() {
		var that = this;
		this.moduleName = "lan6Cfg";
		this.init = function () {
			this.initEvent();
		};
		this.initEvent = function () {
			$("#ipv6LanType").on("change", this.changeLanType);
			$("#ipv6LanDhcpPrefixType").on("change", this.changeLanPrefixType);
			$("#ipv6LanDhcpEn").on("change", this.changeDhcp);
			$("#ipv6LanDhcpType").on("change", this.changeDhcpType);
			$("#ipv6LanDnsType").on("change", this.changeDnsType);
			$("select").on("change", mainLogic.initModuleHeight); //让这个事件最后绑定,否则会先执行其他函数
			$("#ipv6PPPoeTemporary,#ipv6PPPoeDelegation").on("click",this.disablePrefix);
		};
		this.initValue = function (obj) {
			$("#ipv6Lan").find("input,select").each(function () {
				$this = $(this);
				if (obj[$this.attr("name")]) {
					$this.val(obj[$this.attr("name")]);
				}
			});
			that.changeAll();
		};
		this.getSubmitData = function () {
			var data = {
				module3: that.moduleName
			};
			if ($('#ipv6-btn').attr("class").indexOf("icon-toggle-on") > -1) { //ipv6打开时才传数据	

				$("#ipv6Lan").find("select").each(function () {
					$this = $(this);
					data[$this.attr("name")] = $this.val(); //先给select的input赋值
					if ($this.val() == "1" || ($this.attr("id") == "ipv6LanDhcpType" && $this.val() == "0")) { //只有manual时才需要去取下面的输入框的值
						$("#" + $this.attr("name") + "Wrap").find("input").each(function () {
							var $this2 = $(this);
							data[$this2.attr("name")] = $this2.val(); //取值input
						});
					}
				});

				//dhcp 这个select框需要单独处理下
				if ($("#ipv6LanDhcpEn").val() == "0") { //disable时不需要dhcp地址池
					delete data.ipv6LanDhcpType; //删除这个值
					if ($("#ipv6LanDhcpType").val() == "0") {
						delete data.ipv6LanDhcpStartID;
						delete data.ipv6LanDhcpEndID; //将这下面的两个值删除
					}
				}
				if (data.ipv6LanDhcpEn == "1") {
					data.ipv6LanDhcpEn = "true";
				} else {
					data.ipv6LanDhcpEn = "false"; //转成true和false
				}
			}
			return objToString(data);
		};
		this.changeLanType = function () {
			var select = $("#ipv6LanType").val();
			if (select == "0") {
				$("#ipv6LanTypeWrap").addClass("none");
			} else {
				$("#ipv6LanTypeWrap").removeClass("none");
			}
		};
		this.changeLanPrefixType = function () {
			var select = $("#ipv6LanDhcpPrefixType").val();
			if (select == "0") {
				$("#ipv6LanDhcpPrefixTypeWrap").addClass("none");
			} else {
				$("#ipv6LanDhcpPrefixTypeWrap").removeClass("none");
			}
		};
		this.changeDhcp = function () {
			var select = $("#ipv6LanDhcpEn").val();
			if (select == "0") {
				$("#dhcpWrap").addClass("none");
			} else {
				$("#dhcpWrap").removeClass("none");
			}
		};
		this.changeDhcpType = function () {
			var select = $("#ipv6LanDhcpType").val();
			if (select == "1") {
				$("#ipv6LanDhcpTypeWrap").addClass("none");
			} else {
				$("#ipv6LanDhcpTypeWrap").removeClass("none");
			}
		};
		this.changeDnsType = function () {
			var select = $("#ipv6LanDnsType").val();
			if (select == "0") {
				$("#ipv6LanDnsTypeWrap").addClass("none");
			} else {
				$("#ipv6LanDnsTypeWrap").removeClass("none");
			}
		};
		this.changeAll = function () {
			this.changeLanType();
			this.changeLanPrefixType();
			this.changeDhcp();
			this.changeDhcpType();
			this.changeDnsType();
			this.disablePrefix();
		};
		this.disablePrefix = function(){
			if($("#ipv6PPPoeTemporary")[0].checked == true &&　$("#ipv6PPPoeDelegation")[0].checked == true ){
				$("#ipv6LanDhcpPrefixType").val("0").attr("disabled","disabled");
				that.changeLanPrefixType();
			}else{
				$("#ipv6LanDhcpPrefixType").removeAttr("disabled");
			}
		};
		//两个数据是否相等
		this.cmp_v6addr = function (a1, a2) {
			return (a1.replace(/:0+/g, ":") == a2.replace(/:0+/g, ":"));
		};

		this.checkData = function () {
			var ipv6En = $('#ipv6-btn').attr("class").indexOf("icon-toggle-on") > -1;
			var ipv6LanType = $("#ipv6LanType").val();
			var ipv6WanIP = $("[name=ipv6WanIP]").val();
			var ipv6LanIP = $("[name=ipv6LanIP]").val();
			var ipv6dhcpEn = $("#ipv6LanDhcpEn").val();
			var ipv6LanDhcpType = $("#ipv6LanDhcpType").val();
			var ipv6LanDhcpStartID = $("[name=ipv6LanDhcpStartID]").val();
			var ipv6LanDhcpEndID = $("[name=ipv6LanDhcpEndID]").val();
			var ipv6LanDnsType = $("#ipv6LanDnsType").val();
			var ipv6LanDns1 = $("[name=ipv6LanDns1]").val();
			var ipv6LanDns2 = $("[name=ipv6LanDns2]").val();

			//ipv6开启时
			if (ipv6En) {

				//手动配置LAN地址
				if (+ipv6LanType == 1) {

					if (ipv6LanIP.slice(0, 2).toLowerCase() == "fe" && ipv6WanIP.slice(0, 4).toLowerCase() != "fe80") {
						return _("please input a valid IPv6 Address.")
					}

					//ipv6 wan地址不与能lan地址相同@edit by pjl
					if (that.cmp_v6addr(ipv6LanIP, ipv6WanIP)) {
						return _("IPv6 wan Address and Lan address cannot be the same.");
					}
				}

				//且DHCP开启且选择手动配置时
				if (+ipv6dhcpEn == 1 && +ipv6LanDhcpType == 0) {
					if ((ipv6LanDhcpStartID.indexOf("::") != -1 && ipv6LanDhcpEndID.indexOf("::") != -1) || (ipv6LanDhcpStartID.indexOf("::") == -1 && ipv6LanDhcpEndID.indexOf("::") == -1)) {
						var endArry = ipv6LanDhcpEndID.split(":"),
							startArry = ipv6LanDhcpStartID.split(":"),
							len = endArry.length,
							i = 0;
						for (i = 0; i < len; i++) {
							if (endArry[i] != "") {
								if (parseInt(startArry[i], 10) > parseInt(endArry[i], 10)) {
									return _("Start IP must be less than end IP.");
								}
							}

						}
					} else {
						return _("End ID must be the same format width the Start ID");
					}



					if (ipv6LanDhcpStartID > ipv6LanDhcpEndID) {
						return _("O endereço inicial não pode ser maior do que o endereço final");
					}
				}

				//验证 DNS手动配置时，判断dns1与dns2是否相同
				if (+ipv6LanDnsType == 1) {
					if (that.cmp_v6addr(ipv6LanDns1, ipv6LanDns2) && ipv6LanDns1 != "") {
						return _("Secondary DNS and Primary DNS cannot be the same.")
					}
				}
			}
			return;
		}

	}


	//ipv6Status
	var ipv6Status = new Ipv6Status();
	pageModule.modules.push(ipv6Status);

	function Ipv6Status() {
		var that = this;
		this.moduleName = "ipv6Status";
		this.init = function () {
			mainLogic.initModuleHeight();
		};
		this.initEvent = function () {

		};
		this.initValue = function (obj) {
			var height,
				wanLen,
				lanLen;

			if (obj.wanAddr.match(/\n/g) && obj.wanAddr.match(/\n/g).length > 2) {
				wanLen = obj.wanAddr.match(/\n/g).length;
				height = wanLen * 20 + "px";
				$("#wanExtend").css("height", height);
			}
			if (obj.lanAddr.match(/\n/g) && obj.lanAddr.match(/\n/g).length > 2) {
				lanLen = obj.lanAddr.match(/\n/g).length;
				height = lanLen * 20 + "px";
				$("#lanExtend").css("height", height);
			}

			$("#ipv6Status").find(".form-text").each(function () {
				$this = $(this);
				if (obj[$this.attr("name")]) {
					// $this.html(obj[$this.attr("name")].replace(/\n/g,"<br>"));
					$this.html(_(obj[$this.attr("name")].replace(/\n/g, "<br>")));
				}
			});
		};
	}

});