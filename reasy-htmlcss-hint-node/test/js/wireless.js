define(function (require, exports, module) {

	var pageModule = new PageLogic({
		getUrl: "goform/getWifi",
		modules: "wifiEn,wifiBasicCfg,wifiAdvCfg,wifiPower,wifiTime,wifiWPS",
		setUrl: "goform/setWifi"
	});

	pageModule.modules = [];
	pageModule.rebootIP = location.host;
	module.exports = pageModule;

	pageModule.initEvent = function () {
		pageModule.update("wifiAdvCfg,wifiTime", 2000, update);
	}

	function update(obj) {

		if (obj.wifiAdvCfg.wifiChannelCurrent == "0") {
			$("#wifiBandwidthCurrent, #wifiChannelCurrent").addClass("none");
		} else {
			$("#wifiBandwidthCurrent, #wifiChannelCurrent").removeClass("none");
		}

		$("#wifiChannelCurrent").text(obj.wifiAdvCfg.wifiChannelCurrent);
		$("#wifiBandwidthCurrent").text(obj.wifiAdvCfg.wifiBandwidthCurrent == "" ? "" : (obj.wifiAdvCfg.wifiBandwidthCurrent + "MHz"));

		var type = obj.wifiTime.wifiRelayType;
		changeWifiRelayType(type);
	}

	function changeWifiRelayType(type) {
		if (type == "disabled" || type == "ap") {
			$("#wpsWrap, #wifiScheduleWrap, #wifiParamWrap").removeClass("none");
		} else {
			$("#wpsWrap, #wifiScheduleWrap, #wifiParamWrap").addClass("none")
		}
		top.mainLogic.initModuleHeight();

	}

	pageModule.beforeSubmit = function () {
		var wifiPwd = $("#wifiPwd").val(),
			pwd = pageModule.data.wifiBasicCfg.wifiPwd,
			wifiSecurityMode = $("#wifiSecurityMode").val();

		if (pageModule.data.wifiBasicCfg.wifiSSID != $("#wifiSSID").val() || (wifiPwd !== pwd && wifiSecurityMode != "none")) {
			if (!confirm(_("The wireless connection will disconnect, please connect again."))) {
				return false;
			}
		}
		return true;
	}

	/*************Page Control*********/
	var pageModuleInit = new PageModuleInit();
	pageModule.modules.push(pageModuleInit);

	function PageModuleInit() {

		this.initValue = function () {
			var type = pageModule.data.wifiTime.wifiRelayType;
			changeWifiRelayType(type);

		}
	}
	/*************END Page Control***********/

	/*
	 * 显示无线开关状态
	 * @method wifiEnModule
	 * @param {Object} wifiEn 从后台获取的关于无线开关状态的数据
	 * @return {无}
	 */
	var wifiEnModule = new WifiEnModule();
	pageModule.modules.push(wifiEnModule);

	function WifiEnModule() {
		this.moduleName = "wifiEn";

		this.init = function () {
			this.initEvent();
		};

		/**
		 * [initValue 用于初始化显示的数据]
		 * @param  {object} obj [wifiEn]
		 */
		this.initValue = function (obj) {
			$("#wifiEn").html("");
			if (obj.wifiEn == "true") {
				$("#wifiWrap").show();
				$("#wifiEn").removeClass("icon-toggle-off").addClass("icon-toggle-on");
			} else {
				$("#wifiWrap").hide();
				$("#wifiEn").removeClass("icon-toggle-on").addClass("icon-toggle-off");
			}
		};

		this.initEvent = function () {
			$("#wifiEn").on("click", changeWifiEn);
		};

		this.getSubmitData = function () {
			var data = {
				module1: this.moduleName,
				wifiEn: $("#wifiEn").hasClass("icon-toggle-on") || "false",
			};

			return objToString(data);
		};

		function changeWifiEn() {
			if ($("#wifiEn").hasClass("icon-toggle-off")) {
				$("#wifiWrap").show();
				$("#wifiEn").removeClass("icon-toggle-off").addClass("icon-toggle-on");
			} else {
				$("#wifiWrap").hide();
				$("#wifiEn").removeClass("icon-toggle-on").addClass("icon-toggle-off");
			}
			top.mainLogic.initModuleHeight();
		}

	}
	/*********************end wifiEn***********************/

	/*
	 * 显示无线基本配置
	 * @method wifiBasicCfgModule
	 * @param {Object} wifiBasicCfg 从后台获取的关于无线基本设置信息
	 * @return {无}
	 */
	var wifiBasicCfgModule = new WifiBasicCfgModule();
	pageModule.modules.push(wifiBasicCfgModule);

	function WifiBasicCfgModule() {

		var _this = this;
		this.moduleName = "wifiBasicCfg";

		this.init = function () {
			this.initEvent();
		};
		this.initEvent = function () {
			this.addInputEvent = false;
			$("#wifiSecurityMode").on("change", _this.changeSecurityMode);
			$("#helpTips").on("mouseover", function () {
				$("#hideSSIDTips").show();
			});
			$("#helpTips").on("mouseout", function () {
				$("#hideSSIDTips").hide();
			});
		};

		/**
		 * [initValue 用于初始化显示的数据]
		 * @param  {object} obj [wifiBasicCfg]
		 */
		this.initValue = function (obj) {
			//重置（点击取消时将容错提示语去掉）
			$("#wifiSSID").removeValidateTipError(true);

			inputValue(obj);
			if (!this.addInputEvent) {
				$("#wifiSSID").addPlaceholder(_("WiFi Name"));
				$("#wifiPwd").initPassword(_("WiFi Password"));
				this.addInputEvent = true;
			}
			_this.changeSecurityMode();
		};

		this.getSubmitData = function () {
			var data = {
				module2: this.moduleName,
				wifiSSID: $("#wifiSSID").val(),
				wifiSecurityMode: $("#wifiSecurityMode").val(),
				wifiPwd: $("#wifiPwd").val(),
				wifiHideSSID: $("#wifiHideSSID:checked").val() || "false"
			};

			return objToString(data);
		};

		/***********改变加密模式******/
		this.changeSecurityMode = function () {
			var securityMode = $("#wifiSecurityMode").val();
			if (securityMode != "none") {
				$("#wifiPwd").parent().parent().removeClass("none");
			} else {
				$("#wifiPwd").parent().parent().addClass("none");
			}

			if (securityMode != "wpa-psk") {
				$("#wps").show();
			} else {
				$("#wps").hide();
			}

			top.mainLogic.initModuleHeight();
		}
	}
	/*************END WiFi Name and Password***************/

	/*
	 * 显示无线时间设置
	 * @method wifiTimeModule
	 * @param {Object} wifiTime 从后台获取的关于无线时间信息
	 * @return {无}
	 */
	var wifiTimeModule = new WifiTimeModule();
	pageModule.modules.push(wifiTimeModule);

	function WifiTimeModule() {
		var oldDate; /******保存初始化日期******/
		this.moduleName = "wifiTime";

		this.init = function () {
			this.initHtml();
			this.initEvent();
		}
		this.initHtml = function () {
			var hourStr = "",
				minStr = "",
				i = 0;
			for (i = 0; i < 24; i++) {
				hourStr += "<option value='" + ("100" + i).slice(-2) + "'>" + ("100" + i).slice(-2) + "</option>";
			}

			$("#startHour, #endHour").html(hourStr);

			for (i = 0; i < 60; i++) {
				if (i % 5 === 0) {
					minStr += "<option value='" + ("100" + i).slice(-2) + "'>" + ("100" + i).slice(-2) + "</option>";
				}
			}
			$("#startMin, #endMin").html(minStr);
		};
		this.initEvent = function () {
			$("input[name='wifiTimeEn']").on("click", changeWifiTimeEn);
			$("[id^=day]").on("click", clickTimeDay);
		};

		/**
		 * [initValue 用于初始化显示的数据]
		 * @param  {object} obj [wifiTime]
		 */
		this.initValue = function (obj) {
			inputValue(obj);
			translateDate(obj.wifiTimeDate);
			oldDate = obj.wifiTimeDate;
			var time = obj.wifiTimeClose.split("-");
			$("#startHour").val(time[0].split(":")[0]);
			$("#startMin").val(time[0].split(":")[1]);
			$("#endHour").val(time[1].split(":")[0]);
			$("#endMin").val(time[1].split(":")[1]);
			changeWifiTimeEn();
		};
		this.checkData = function () {
			if ($("[name='wifiTimeEn']")[0].checked) {
				var date = getScheduleDate();
				if (date == "00000000") {
					return _("Select one day at least.");
				}
			}
			return;
		};
		this.getSubmitData = function () {
			var time = $("#startHour").val() + ":" + $("#startMin").val() + "-" +
				$("#endHour").val() + ":" + $("#endMin").val();
			var data = {
				module3: this.moduleName,
				wifiTimeEn: $("input[name='wifiTimeEn']:checked").val() || "false",
				wifiTimeClose: time,
				wifiTimeDate: getScheduleDate()
			};
			return objToString(data);
		};

		/*******启用或禁用定时开关********/
		function changeWifiTimeEn() {
			if ($("input[name='wifiTimeEn']")[0].checked) {
				$("#wifiScheduleCfg").show();
			} else {
				$("#wifiScheduleCfg").hide();
			}
			top.mainLogic.initModuleHeight();
		}
		/*********获取定时重启日期字符串***********/
		function getScheduleDate() {
			var i = 0,
				len = 8,
				str = "";
			for (i = 0; i < len; i++) {
				if ($("#day" + i)[0].checked) {
					str += "1";
				} else {
					str += "0";
				}
			}
			return str;
		}

		/**********点击everyday**********/
		function clickTimeDay() {
			var dataStr = getScheduleDate();
			if (this.id == "day0") { //点击everyday
				if (this.checked) {
					translateDate("11111111");
				} else {
					translateDate("00000000");
				}
			} else {
				if (dataStr.slice(1) == "1111111") {
					translateDate("11111111");
				} else {
					translateDate("0" + dataStr.slice(1));
				}
			}
		}

		/*******根据字符串改变日期的选择*******/
		function translateDate(str) {
			var dayArry = str.split(""),
				len = dayArry.length,
				i = 0;
			for (i = 0; i < len; i++) {

				$("#day" + i)[0].checked = dayArry[i] == 1;
			}
		}

	}
	/*************END WiFi Schedule *****************************/

	/*
	 * 显示无线WPS设置
	 * @method wifiWPSModule
	 * @return {无}
	 */
	var wifiWPSModule = new WifiWPSModule();
	pageModule.modules.push(wifiWPSModule);

	function WifiWPSModule() {
		this.moduleName = "wifiWPS";

		this.init = function () {
			this.initEvent();
		}
		this.initEvent = function () {
			$("input[name='wpsEn']").on("click", changeWpsEn);


			$("#wpsPBC").on("click", function () {
				$("#wpsPBC").attr("disabled", true);
				$.post("goform/setWifiWps", "action=pbc", function (msg) {
					if (checkIsTimeOut(msg)) {
						top.location.reload(true);
						return;
					}
					mainLogic.showModuleMsg(_("PBC configured successfully!"));
					$("#wpsPBC").removeAttr("disabled");
				});
			});
		};

		/**
		 * [initValue 用于初始化显示的数据]
		 * @param  {object} obj [wifiWPS]
		 */
		this.initValue = function (obj) {
			inputValue(obj);
			changeWpsEn();
		}
		this.getSubmitData = function () {
			var data = {
				module4: this.moduleName,
				wpsEn: $("input[name='wpsEn']:checked").val() || "false"
			};
			return objToString(data);
		}

		/*******启用或禁用WPS********/
		function changeWpsEn() {
			if ($("input[name='wpsEn']")[0].checked) {
				$("#wpsCfg").removeClass("none");
				// $("#wifiPwd").removeValidateTipError(true);
				// $("#wifiSecurityMode").val(pageModule.data.wifiBasicCfg.wifiSecurityMode);
				// $("#wifiPwd").val(pageModule.data.wifiBasicCfg.wifiPwd);
				// wifiBasicCfgModule.changeSecurityMode();

			} else {
				// $("#wifiSecurityMode").removeAttr("disabled");
				// $("#wifiPwd").removeAttr("disabled");
				$("#wpsCfg").addClass("none");
			}
			top.mainLogic.initModuleHeight();
		}
	}
	/*************END WPS *******************************/

	/*
	 * 显示无线高级参数设置
	 * @method wifiAdvCfgModule
	 * @param {Object} wifiAdvCfg 从后台获取的关于无线高级参数信息
	 * @return {无}
	 */
	var wifiAdvCfgModule = new WifiAdvCfgModule();
	pageModule.modules.push(wifiAdvCfgModule);

	function WifiAdvCfgModule() {
		this.moduleName = "wifiAdvCfg";

		this.init = function () {
			this.initEvent();
		};

		this.initEvent = function () {
			$("#wifiMode").on("change", function () {
				changeWifiMode();
			});
		};

		/**
		 * [initValue 用于初始化显示的数据]
		 * @param  {object} obj [wifiAdvCfg]
		 */
		this.initValue = function (obj) {
			obj.wifiBandwidthCurrent = obj.wifiBandwidthCurrent + "MHz";
			createChannel(+obj.wifiMaxChannel);
			changeWifiMode(obj.wifiMode);
			inputValue(obj);
			if (obj.wifiChannelCurrent == "0") {
				$("#wifiBandwidthCurrent, #wifiChannelCurrent").addClass("none");
			} else {
				$("#wifiBandwidthCurrent, #wifiChannelCurrent").removeClass("none");
			}

		};

		this.getSubmitData = function () {
			var data = {
				module5: this.moduleName,
				wifiMode: $("#wifiMode").val(),
				wifiChannel: $("#wifiChannel").val(),
				wifiBandwidth: $("#wifiBandwidth").val()
			}
			return objToString(data);
		};

		function createChannel(max) {
			var str = '<option value="auto">' + _("Auto") + '</option>';
			for (i = 1; i <= max; i++) {
				str += '<option value="' + i + '">' + _("Channel") + " " + i + " (" + (2407 + i * 5) + 'MHz)</option>';
			}

			$("#wifiChannel").html(str);
		}

		function changeWifiMode(mod) {
			var mode = mod || $("#wifiMode").val();

			if (mode === "bgn") {
				$("#wifiBandwidth").html('<option value="auto">' + _("Auto") + '</option><option value="20">20MHz</option><option value="40">40MHz</option>');
			} else {
				$("#wifiBandwidth").html('<option value="20">20MHz</option>');
			}
		}
	}
	/**************END Wireless Parameters********/

	/*
	 * 显示信号强度参数设置
	 * @method wifiPowerModule
	 * @param {Object} wifiPower 从后台获取的关于无线信号强度的参数
	 * @return {无}
	 */
	var wifiPowerModule = new WifiPowerModule();
	pageModule.modules.push(wifiPowerModule);

	function WifiPowerModule() {

		this.moduleName = "wifiPower";
		/**
		 * [initValue 用于初始化显示的数据]
		 * @param  {object} obj [wifiPower]
		 */
		this.initValue = function (obj) {
			inputValue(obj);
			createPowerView(obj.wifiPowerGear);

		};

		this.getSubmitData = function () {
			var data = {
				module6: this.moduleName,
				wifiPower: $("input[name=wifiPower]:checked")[0].value,
			}
			return objToString(data);
		};

		function createPowerView(gear) {
			if (gear == "hide_power") {
				$("#wifiSignal").hide();
			} else if (gear == "hide_normal") {
				$("#wifiPowerNormalWrap").hide();
			}
		}
	}
	/**************END Wireless Power********/



})