define(function (require, exports, module) {
	var pageModule = new PageLogic({
		getUrl: "goform/getWAN",
		modules: "lanCfg,wanBasicCfg,wanAdvCfg,internetStatus",
		setUrl: "goform/setWAN"
	});

	pageModule.modules = [];
	module.exports = pageModule;
	module.IPConflictAlert = false;

	pageModule.initEvent = function () {
		pageModule.update("internetStatus", 3000, function (obj) {
			obj = obj.internetStatus;

			updateInternetConnectStatus(obj, "wanConnectStatus");
		});
	}

	/*
	 * @method wanModule [用于显示及配置WAN口基本设置的构造函数]
	 * @return {无}
	 */
	var wanModule = new WanModule();
	pageModule.modules.push(wanModule);

	function WanModule() {
		var _this = this;
		_this.data = {};

		this.moduleName = "wanBasicCfg";

		this.init = function () {
			this.initEvent();
		};

		this.initEvent = function () {
			this.addInputEvent = false;
			$("#wanIP").toTextboxs("ip-mini");
			$("#wanMask").toTextboxs("ip-mini", "255.255.255.0");
			$("#wanGateway").toTextboxs("ip-mini");
			$("#wanDns1").toTextboxs("ip-mini");
			$("#wanDns2").toTextboxs("ip-mini");

			$("input[name='wanType']").on('click', this.changeWanType);

			$("#wan").delegate(".textboxs", "focus.textboxs blur.textboxs", function () {
				$(this).val(this.val());
			});
			$("#connectInfo").delegate("#cloneMac", "click", this.cloneMAC);
			$(".textboxs").each(function () {
				$(this).val(this.val());
			});
		};

		/**
		 * @method [initValue] [初始化wan基本参数配置数据及连接状态，检测WAN口冲突]
		 * @param  {[type]} obj [description]
		 * @return {[type]}     [description]
		 */
		this.initValue = function (obj) {
			$("#wanPPPoEUser, #wanPPPoEPwd, #wanIP, #wanMask, #wanGateway, #wanDns1, #wanDns2").removeValidateTipError(true);

			_this.data = pageModule.data;
			this.rebootIP = _this.data.lanCfg.lanIP;
			inputValue(obj);

			//只有在static时才赋值IP地址
			if (obj.wanType != "static") {
				$("#wanIP")[0].val("");
				$("#wanMask")[0].val("");
				$("#wanGateway")[0].val("");
				$("#wanDns1")[0].val("");
				$("#wanDns2")[0].val("");
			}

			//作用标记使用，让addplaceholder, initPassword只执行一次
			if (!this.addInputEvent) {
				$("#wanPPPoEUser").addPlaceholder(_("User Name from ISP"));
				$("#wanPPPoEPwd").initPassword(_("Password from ISP"));
				this.addInputEvent = true;
			}
			this.changeWanType();

			updateInternetConnectStatus(_this.data.internetStatus, "wanConnectStatus");
		};

		this.changeWanType = function () {
			var wanType = $("input[name='wanType']:checked").val();
			if (wanType == "pppoe") {
				$("#dhcp-set").addClass("none");
				$("#pppoe-set").removeClass("none");
				$("#static-set").addClass('none');
			} else if (wanType == "dhcp") {
				$("#dhcp-set").removeClass("none");
				$("#pppoe-set").addClass("none");
				$("#static-set").addClass('none');
			} else {
				$("#dhcp-set").addClass("none");
				$("#pppoe-set").addClass("none");
				$("#static-set").removeClass('none');
			}

			//当前连接方式不是初始化的方式时，隐藏连接状态
			if (_this.data.wanBasicCfg.wanType == wanType) {
				$("#connectInfo").removeClass("none");
			} else {
				$("#connectInfo").addClass("none");
			}

			top.mainLogic.initModuleHeight();
		};

		this.cloneMAC = function () {

			var macHost = pageModule.data.wanAdvCfg.macHost,
				obj = {
					"module1": "wanAdvCfg",
					"macClone": "clone",
					"wanMAC": macHost
				},
				submitStr = "";

			submitStr = objToString(obj);
			$.post("goform/setMacClone?" + Math.random(), submitStr, function (str) {
				if (checkIsTimeOut(str)) {
					top.location.reload(true);
					return;
				}
				var num = $.parseJSON(str).errCode || "-1";
				if (num == 0) {
					mainLogic.showModuleMsg(_("Clone MAC successfully!"));
				}
			})
		}
		this.checkData = function () {
			var wanType = $("input[name='wanType']:checked").val(),
				ip = $("#wanIP")[0].val(),
				mask = $("#wanMask")[0].val(),
				gateway = $("#wanGateway")[0].val(),
				dns1 = $("#wanDns1")[0].val(),
				dns2 = $("#wanDns2")[0].val(),
				msg = "";
			var lanIp = _this.data.lanCfg.lanIP,
				lanMask = _this.data.lanCfg.lanMask;
			if (wanType == "pppoe") {

			} else if (wanType == "static") {
				msg = checkIsVoildIpMask(ip, mask, _("IP Address"));
				if (msg) {
					return msg;
				}
				if (checkIpInSameSegment(ip, mask, lanIp, lanMask)) {
					return _("%s and %s (%s) should not be in the same network segment.", [_("WAN IP"), _("LAN IP"), lanIp]);
				}
				if (!checkIpInSameSegment(ip, mask, gateway, mask)) {
					return _("%s and %s must be in the same network segment.", [_("WAN IP"), _("Gateway")]);
				}

				if (ip == gateway) {
					return _("WAN IP and Default Gateway can't be the same.");;
				}

				if (dns1 == dns2) {
					return _("Preferred DNS server and Alternative DNS server can't be the same.");
				}
			}
			return;
		};

		this.getSubmitData = function () { //获取提交数据
			var data = {
				module1: _this.moduleName,
				wanType: $("input[name='wanType']:checked").val(),
				wanPPPoEUser: $("#wanPPPoEUser").val(),
				wanPPPoEPwd: $("#wanPPPoEPwd").val(),
				wanIP: $("#wanIP")[0].val(),
				wanMask: $("#wanMask")[0].val(),
				wanGateway: $("#wanGateway")[0].val(),
				wanDns1: $("#wanDns1")[0].val(),
				wanDns2: $("#wanDns2")[0].val()
			}
			return objToString(data);

		}
	}
	/************END WAN Setting*************/
})