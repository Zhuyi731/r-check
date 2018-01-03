define(function (require, exports, module) {

	/***************页面信息初始化**************/
	var pageModule = new PageLogic({
		getUrl: "goform/getStatus",
		modules: "internetStatus,deviceStatistics,systemInfo,wanAdvCfg"
	});

	pageModule.modules = [];

	var statusTimer = null;
	pageModule.initEvent = function () {
		pageModule.pageRunning = true;
		clearInterval(statusTimer);
		statusTimer = setInterval(function () {
			pageModule.getValue("goform/getStatus", "internetStatus,deviceStatistics,systemInfo,wanAdvCfg");
		}, 3000);

		if (!pageModule.pageRunning) {
			clearInterval(statusTimer);
			return;
		}

		pageModule.update("internetStatus", 3000, function (obj) {
			obj = obj.internetStatus;
			updateInternetConnectStatus(obj, "wan-connect-status");
		});
	}

	module.exports = pageModule;

	/*
	 *
	 * @method statusSysModule [显示联网状态模块的数据]
	 * @return {无}
	 */
	var statusSysModule = new StatusSysModule();
	pageModule.modules.push(statusSysModule);

	function StatusSysModule() {
		var _this = this;
		_this.data = {};
		this.moduleName = "internetStatus";

		this.init = function () {
			this.initEvent();
		};
		this.initEvent = function () {
			$("#statusInternet").delegate("#cloneMac", "click", cloneMAC);
			$("#statusInternet").delegate("#toNetwork", "click", function(){
				$("#network")[0].click();
			});
		};
		this.initValue = function (obj) {
			_this.data = pageModule.data;

			updateInternetConnectStatus(_this.data.internetStatus, "wan-connect-status");

			if (obj.wanConnectStatus.slice(2, 3) == "1") {
				$(".pic-wan").removeClass("pic-wan-error");
			} else {
				$(".pic-wan").addClass("pic-wan-error");
			}
		};

		function cloneMAC() {
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
	}
	/***************END Internet Connection Status*******************/


	/*
	 * 显示带宽，用户数等信息
	 * @method deviceStastics
	 * @param {Object} deviceStastics 从后台获取的关于联网状态的数据
	 * @return {无}
	 */
	var deviceStastics = new DeviceStastics();
	pageModule.modules.push(deviceStastics);

	function DeviceStastics() {
		this.moduleName = "deviceStastics";
		this.init = function () {
			this.initEvent();
		};
		this.initEvent = function () {
			$("#statistic fieldset").on("click", function () {
				mainLogic.changeMenu("net-control");
			});
		};
		this.initValue = function (obj) {

			$("#statusOnlineNumber").html(obj.statusOnlineNumber);
			shapingSpeed("statusDownSpeed", obj.statusDownSpeed);
			shapingSpeed("statusUpSpeed", obj.statusUpSpeed);
			if (pageModule.data.internetStatus.wanConnectStatus.slice(2, 3) == "0") {
				$("#statistic").hide();
			} else {
				$("#statistic").show();
			}

		};
	}

	function shapingSpeed(id, value) {
		var val = parseFloat(value);

		if (val > 1024) {
			$("#" + id).html((val / 1024).toFixed(1));
			$("#" + id + "~small").html(_("MB/s"));
		} else {
			$("#" + id).html(val.toFixed(1));
			$("#" + id + "~small").html(_("KB/s"));
		}
	}
	/***************END Attached Devices and Real-time Statistics************/


	/*
	 *
	 * @method systemInfo [显示系统的信息]
	 * @return {无}
	 */
	var systemInfo = new SystemInfo();
	pageModule.modules.push(systemInfo);

	function SystemInfo() {
		this.moduleName = "systemInfo";

		this.initValue = function (obj) {
			switch (obj.wanType) {
			case "dhcp":
				obj.wanType = _("Dynamic IP");
				break;
			case "pppoe":
				obj.wanType = _("PPPoE");
				break;
			default:
				obj.wanType = _("Static IP");
			}

			//当WAN口没有IP时，不显示
			if (pageModule.data.internetStatus.wanConnectStatus.slice(2, 3) == "0") {
				$("#statusWAN").hide();
			} else {
				$("#statusWAN").show();
			}

			for (var prop in obj) {
				if (obj[prop] == "") {
					obj[prop] = "-";
				}
			}
			inputValue(obj);

			$("#wanConnectTime").html(formatSeconds(obj.wanConnectTime));
		};
	}
	/***************END System Info***************/

})