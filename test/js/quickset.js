function ModuleLogic(view) {
	var that = this;
	this.init = function () {
		$("input[name=wanType][value=pppoe]")[0].checked = true;
		this.currenPageId = "quickSetWrap";
		this.nextPageId = null;
		this.initEvent();
		this.getValue();
	};

	this.timer = null; //定时器
	this.initEvent = function () { //初始化事件

		that.addInputEvent = false;

		/**wifi 模块事件*/
		$("#save").on("click", function () {
			view.checkData("quickSetWrap", "quicksetDoneWrap");
		});

		$("input[name=wanType]").on("click", function () {
			that.changeWanType();
		});

	};

	this.changeWanType = function () {
		var wanType = $("input[name=wanType]:checked").val();
		$("#quickSetPPPoEWrap, #quickSetStaticWrap, #quickSetDHCPWrap").addClass("none");
		switch (wanType) {
		case "pppoe":
			$("#quickSetPPPoEWrap").removeClass("none");
			break;
		case "static":
			$("#quickSetStaticWrap").removeClass("none");
			break;
		default: //dhcp
			$("#quickSetDHCPWrap").removeClass("none");
		}
	};

	this.getValue = function () {
		var modules = "lanCfg,wanDetection,wanBasicCfg,isWifiClients,wifiBasicCfg",
			data = "?random=" + Math.random() + "&modules=" + encodeURIComponent(modules);

		$.get("goform/getWizard" + data, function (str) {
			var obj = {};

			try {
				obj = $.parseJSON(str);
			} catch (e) {
				obj = {};
			}

			that.initValue(obj);
		});
	}

	//初始化数据
	this.initValue = function (obj) {

		view.lanIP = obj.lanCfg.lanIP;
		view.lanMask = obj.lanCfg.lanMask;
		view.srcSSID = obj.wifiBasicCfg.wifiSSID;
		view.connectTypes = obj.isWifiClients.isWifiClients || "false";

		if (!that.addInputEvent) {
			$("#wifiSSID").val(obj.wifiBasicCfg.wifiSSID);
			$("#wifiPwd").val(obj.wifiBasicCfg.wifiPwd);
			$("#wanPPPoEUser").addPlaceholder(_("User Name from ISP"));
			$("#wanPPPoEPwd").initPassword(_("Password from ISP"));
			$("#wifiSSID").addPlaceholder(_("WiFi Name"));
			$("#wifiPwd").initPassword(_("WiFi Password"));
			that.addInputEvent = true;
		}

		that.timer = setTimeout(function () {
			that.getValue();
		}, 2000);


		if (obj.wanDetection.wanDetection != "detecting" && obj.wanDetection.wanDetection != "disabled") {

			$("input[name=wanType][value=" + obj.wanDetection.wanDetection + "]")[0].checked = true;
			that.changeWanType();
		}
		var wanType = $("input[name=wanType]:checked").val(),
			adslStr = "<span class='text-style'>" + _("PPPoE") + "</span>",
			dhcpStr = "<span class='text-style'>" + _("Dynamic IP") + "</span>",
			staticStr = "<span class='text-style'>" + _("Static IP") + "</span>",
			noWireStr = '<span class="text-danger">' + _("Tips: WAN port unplugged! Please plug the Internet cable into it.") + '</span>',
			sysCheckStr = _("As detected, your connection type is:");

		if (obj.wanDetection.wanDetection != "detecting") {
			switch (obj.wanDetection.wanDetection) {

			case "disabled":
				$(".net-status").html(noWireStr);
				break;
			case "pppoe":
				$(".net-status").html(sysCheckStr + adslStr);
				clearTimeout(that.timer);

				break;
			case "dhcp":
				$(".net-status").html(sysCheckStr + dhcpStr);
				clearTimeout(that.timer);

				break;
			case "static":
				$(".net-status").html(sysCheckStr + staticStr);
				clearTimeout(that.timer);

				break;
			}
		};
	};
}


function ModuleView() {
	var that = this;
	this.currenPageId = null; //保存当前页面ID
	this.nextPageId = null; //保存下一个显示ID
	this.lanIP = null;
	this.lanMask = null;
	this.connectTypes = "false"; //无线连接(true), 有线（false）
	this.srcSSID = "";

	//切换页面，不需要验证数据
	this.changePage = function (currenPage, nextPage) {
		var leaftSec = 2,
			distSSID = $("#wifiSSID")[0].value,
			distPwd = $("#wifiPwd")[0].value,
			timer = null;

		$("#wireSuccess").html(_("The page will redirect to User Interface after %s seconds.", [3]));
		$("#" + currenPage).hide();
		$("#" + nextPage).show();
		$("#save")[0].disabled = false;

		if (this.connectTypes == "false" || (this.srcSSID == distSSID && distPwd == "")) { //有线连接或无线默认值未修改时跳到保存成功3s跳转页面;

			$("#wireSuccess").removeClass("none");

			timer = setInterval(function () {
				$("#wireSuccess").html(_("The page will redirect to User Interface after %s seconds.", [leaftSec]));
				leaftSec = leaftSec - 1;
				if (leaftSec < 1) {
					clearInterval(timer);
					window.location = "/index.html";
				}
			}, 1000);

		} else { //无线连接且修改了无线默认值时提示用户重新连接
			$("#wirelessSuccess").removeClass("none");
			$("#newSSID").html(distSSID);
		}

	};

	this._currenId = null; //临时存放数据验证需要参数
	this._nextId = null;
	this.checkData = function (currenPage, nextPage) { //检查数据合法性
		this._currenId = currenPage;
		this._nextId = nextPage;
		this.validate.checkAll();
	}


	//检查静态IP地址合法性
	function checkStaticData() {
		var ip = $("#wanIP").val(),
			mask = $("#wanMask").val(),
			gateway = $("#wanGateway").val(),
			dns1 = $("#wanDns1").val(),
			dns2 = $("#wanDns2").val();
		var lanIp = that.lanIP,
			lanMask = that.lanMask;
		var msg = checkIsVoildIpMask(ip, mask, _("IP Address"));
		if (msg) {
			$("#wanIP").focus();
			return msg;
		}
		if (checkIpInSameSegment(ip, mask, lanIp, lanMask)) {
			$("#wanIP").focus();
			return _("%s and %s (%s) should not be in the same network segment.", [_("WAN IP"), _("LAN IP"), lanIp]);
		}
		if (!checkIpInSameSegment(ip, mask, gateway, mask)) {
			$("#wanGateway").focus();
			return _("%s and %s must be in the same network segment.", [_("WAN IP"), _("Gateway")]);
		}

		if (ip == gateway) {
			return _("WAN IP and Default Gateway can't be the same.");
		}
		if (dns1 == dns2) {
			return _("Preferred DNS server and Alternative DNS server can't be the same.");
		}
	}


	this.validate = $.validate({
		custom: function () {},

		success: function () {
			var currenPage = that._currenId,
				nextPage = that._nextId,
				msg = "",
				wanType = $("[name=wanType]:checked")[0].value;

			if (wanType == "static") {
				msg = checkStaticData();
			}

			if (msg) {
				alert(msg);
				return;
			}
			that.preSubmit(currenPage, nextPage);
		},

		error: function (msg) {}
	});

	function getTimeZone() {
		var a = [],
			b = new Date().getTime(),
			zone = new Date().getTimezoneOffset() / -60;

		if (a = displayDstSwitchDates()) {
			if (a[0] < a[1]) {
				if (b > a[0] && b < a[1]) {
					zone--;
				}
			} else {
				if (b > a[0] || b < a[1]) {
					zone--;
				}
			}
		}
		return zone;
	}

	//提交数据
	this.preSubmit = function (currenPage, nextPage) {
		var data = {},
			subStr;
		$("#quickSetWrap").find("input").each(function () {
			var _this = this,
				name = this.name,
				type = _this.type;
			switch (type) {
			case "radio":
				data.wanType = $("[name=wanType]:checked")[0].value;
				break;
			case "button":
				break;
			default:
				data[name] = this.value;
			}
		});
		data.sysTimeZone = getTimeZone();
		data.module1 = "wifiBasicCfg";
		data.module2 = "wanBasicCfg";
		data.module3 = "sysTime";
		if (data.wifiPwd == "") {
			data.wifiNoPwd = "true";
		}

		subStr = objToString(data);
		$("#save")[0].disabled = true;
		$.post("goform/setWizard", subStr, function (str) {
			var num = $.parseJSON(str).errCode;
			if (num == "0") {
				that.changePage(currenPage, nextPage);
			}
		})
	}
}


$(function () {
	var moduleView = new ModuleView();
	var moduleLogic = new ModuleLogic(moduleView);
	moduleLogic.init();
});