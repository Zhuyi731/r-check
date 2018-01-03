define(function (require, exports, module) {

	var pageModule = new PageLogic({
		getUrl: "goform/getParentControl",
		modules: "parentCtrlList,parentAccessCtrl",
		setUrl: "goform/setParentControl"
	});
	pageModule.modules = [];
	module.exports = pageModule;

	/**
	 * [attachedModule 显示及操作家长控制在线列表]
	 */
	var attachedModule = new AttachedModule();
	pageModule.modules.push(attachedModule);

	function AttachedModule() {
		this.moduleName = "parentCtrlList";
		this.init = function () {
			this.initEvent();
		}
		this.initEvent = function () {
			$("#onlineList").delegate(".icon-toggle-off, .icon-toggle-on", "click", changeDeviceManage);

			$("#onlineList").delegate(".icon-edit", "click", editDeviceName);

			$("#onlineList").delegate(".form-control", "blur", function () {
				$(this).next().attr("title", $(this).val());
				$(this).next().text($(this).val());
				$(this).next().show(); //显示设备名称
				$(this).next().next().show(); //显示编辑按钮
				$(this).hide(); //隐藏自身
			});
		};
		this.initValue = function (onlineArr) {
			//生成在线列表
			var len = onlineArr.length,
				i = 0,
				str = "",
				prop,
				hostname,
				divElem,
				divElem1,
				trElem,
				tdElem;
			$("#onlineList").html("");
			//tr条目的初始化
			for (i = 0; i < len; i++) {

				trElem = document.createElement("tr");

				//td内容的初始化
				var tdStr = "";
				for (prop in onlineArr[i]) {

					if (onlineArr[i].parentCtrlRemark != "") {
						hostname = onlineArr[i].parentCtrlRemark;
					} else {
						hostname = onlineArr[i].parentCtrlHostname;
					}
					//设备名
					if (prop == "parentCtrlHostname") {
						tdStr += '<td><input type="text" class="form-control none device-name" style="width:66%;" value="" maxLength="63" />';
						tdStr += '<div class="col-xs-8 span-fixed device-name-show"></div>';
						tdStr += '<div class="col-xs-2 editDiv"><span class="ico-small icon-edit" title="' + _("Edit") + '">&nbsp;</span></div></td>';

						//IP地址
					} else if (prop == "parentCtrlIP") {
						tdStr += '<td class="hidden-xs">' + onlineArr[i][prop] + '</td>';

						//连接时间
					} else if (prop == "parentCtrlConnectTime") {
						tdStr += '<td class="hidden-xs">' + formatSeconds(onlineArr[i][prop]) + '</td>';

						//管理
					} else if (prop == "parentCtrlEn") {
						if (onlineArr[i][prop] == "true") {
							tdStr += "<td><div class='switch icon-toggle-on'></div></td>";
						} else {
							tdStr += "<td><div class='switch icon-toggle-off'></div></td>";
						}
					}
				}
				//将td附加到tr上
				$(trElem).html(tdStr);

				$(trElem).find(".device-name")[0].value = _(hostname);

				var $deviceNameShow = $(trElem).find(".device-name-show");

				$deviceNameShow.attr("title", _(hostname));
				$deviceNameShow.attr("alt", onlineArr[i].parentCtrlMAC);
				$deviceNameShow.attr("data-mark", onlineArr[i].parentCtrlHostname);

				if (typeof $deviceNameShow.text() != "undefined") {
					$deviceNameShow[0].innerText = _(hostname);
				} else { //firefox
					$deviceNameShow[0].textContent = _(hostname);
				}

				//将tr附加到tbody上
				$("#onlineList").append($(trElem));
			}

			top.mainLogic.initModuleHeight();
		};


		this.checkData = function () {
			var deviceName = "",
				$listTable = $("#onlineList").children(),
				length = $listTable.length,
				$td,
				i = 0;
			for (i = 0; i < length; i++) {
				$td = $listTable.eq(i).children();
				deviceName = $td.find("input").eq(0).val(); //device name
				if (deviceName.replace(/[ ]/g, "") == "") {
					$td.find("input").eq(0).focus();
					return _("Space is not supported in a password!");
				}
			}
			return;
		}
		this.getSubmitData = function () {
			var data = {
				module1: this.moduleName,
				onlineList: getOnlineListData()
			}
			return objToString(data);
		};



		function getOnlineListData() {
			var str = "",
				i = 0,
				listArry = $("#onlineList").children(),
				len = listArry.length,
				hostname;
			for (i = 0; i < len; i++) {
				hostname = $(listArry).eq(i).children().find("div").eq(0).attr("data-mark");
				str += hostname + "\t"; //主机名
				if (hostname == $(listArry).eq(i).children().find("input").val()) {
					str += "\t";
				} else {
					str += $(listArry).eq(i).children().find("input").val() + "\t"; //备注
				}
				str += $(listArry).eq(i).children().find("div").eq(0).attr("alt") + "\t"; //mac
				str += $(listArry).eq(i).children().eq(1).html() + "\t"; //ip
				str += $(listArry).eq(i).children().eq(3).find("div").hasClass("icon-toggle-on") + "\n";
			}
			str = str.replace(/[\n]$/, "");
			return str;
		}

		function editDeviceName() {
			var deviceName = $(this).parent().prev("div").text();
			$(this).parent().parent().find("div").hide();
			$(this).parent().parent().find("input").show();
			$(this).parent().parent().find("input").val(deviceName);
			$(this).parent().parent().find("input").focus();
		}

		function getEnablelist() {
			var index = 0,
				i = 0,
				$listArry = $("#onlineList").children(),
				length = $listArry.length;
			for (i = 0; i < length; i++) {
				if ($listArry.eq(i).children().eq(3).find("div").hasClass("icon-toggle-on")) {
					index++;
				}
			}
			return index;
		}

		function changeDeviceManage() {
			var className = this.className || "icon-toggle-on";
			if (className == "switch icon-toggle-on") {
				this.className = "switch icon-toggle-off";
			} else {
				if (getEnablelist() >= 10) {
					top.mainLogic.showModuleMsg(_("Up to %s entries can be added.", [10]));
					return;
				}
				this.className = "switch icon-toggle-on";
			}
		}

	}
	/*************END Attached Devices************************/

	/**
	 * [restrictionModule 接入限制]
	 * @type {RestrictionModule}
	 */
	var restrictionModule = new RestrictionModule();
	pageModule.modules.push(restrictionModule);

	function RestrictionModule() {
		this.moduleName = "parentAccessCtrl";
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
			$("[id^=day]").on("click", clickTimeDay);
			$("#addUrl").on("click", addUrlList);
			$("#urlList").delegate(".ico", "click", deUrlList);
			$("#parentCtrlURLFilterMode").on("change", changeUrlMode);
			$("#onlineList").delegate(".device-name", "keyup", function () {
				var deviceVal = this.value,
				len = deviceVal.length, //输入总字符数
				totalByte = getStrByteNum(deviceVal); //输入总字节数
				
				if (totalByte > 63) {
					for (var i = len - 1; i > 0; i--) {
					totalByte = totalByte - getStrByteNum(deviceVal[i]);//每循环一次，总字节数就减去最后一个字符的字节数，

						if (totalByte <= 63) {//直到总字节数小于等于63，i值就是边界值的下标
							this.value = deviceVal.slice(0, i);
							break;
						}
					}
				}
			});
		};
		
		/**
		 *
		 * @param  {Object} obj [初始化接入限制的参数]
		 */
		this.initValue = function (obj) {
			//值重置
			$("#urlFilterAllow").val("");

			translateDate(obj.parentCtrlOnlineDate);

			oldDate = obj.parentCtrlOnlineDate;
			var time = obj.parentCtrlOnlineTime.split("-");
			$("#startHour").val(time[0].split(":")[0]);
			$("#startMin").val(time[0].split(":")[1]);
			$("#endHour").val(time[1].split(":")[0]);
			$("#endMin").val(time[1].split(":")[1]);

			$("#parentCtrlURLFilterMode").val(obj.parentCtrlURLFilterMode);
			createUrlList(obj.parentCtrlURL); //生成URLlist
			changeUrlMode();
		}
		this.checkData = function () {
			var date = getScheduleDate();
			if (date == "00000000") {
				return _("Select one day at least.");
			}
			return;
		};
		this.getSubmitData = function () {
			var time = time = $("#startHour").val() + ":" + $("#startMin").val() + "-" +
				$("#endHour").val() + ":" + $("#endMin").val();
			var data = {
				module2: this.moduleName,
				parentCtrlOnlineTime: time,
				parentCtrlOnlineDate: getScheduleDate(),
				parentCtrlURLFilterMode: $("#parentCtrlURLFilterMode").val(),
				urlList: getUrlListData()
			}

			return objToString(data);
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

		var oldDate; /******保存初始化日期******/

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


		function changeUrlMode() {
			var urlMode = $("#parentCtrlURLFilterMode").val();
			if (urlMode != "disable") {
				$("#urlFilterWrap").show();
			} else {
				$("#urlFilterWrap").hide();
			}

			mainLogic.initModuleHeight();
		}



		/*******handle URL*****/
		function CheckUrlVolidate() {
			/*var strRegex = "^((https|http|ftp|rtsp|mms)?://)" //
				+ "?(([0-9a-z_!~*'().= $%-] : )?[0-9a-z_!~*'().= $%-] @)?" //ftp的user@
				+ "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
				+ "|" // 允许IP和DOMAIN（域名）
				+ "([0-9a-z_!~*'()-] \.)*" // 域名- www.
				+ "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
				+ "[a-z]{2,6})" // first level domain- .com or .museum
				+ "(:[0-9]{1,4})?" // 端口- :80
				+ "((/?)|" // a slash isn't required if there is no file name
				+ "(/[0-9a-z_!~*'().;?:@= $,%#-] ) /?)$";
			var re = new RegExp(strRegex);*/
			var re = /^([A-Za-z]+:\/\/)?[A-Za-z0-9-_]{2,}(\.[A-Za-z0-9-_%&?\/.=])?/;
			//(/^([A-Za-z]+:\/\/)?[A-Za-z0-9-_]+(\.[A-Za-z0-9-_%&?\/.=])?/).test("https://wwwcom:8080")
			//re.test()

			var url = $('#urlFilterAllow').val(),
				len = $("#urlList").children().length,
				i = 0;
			if (url == "") {
				$('#urlFilterAllow').focus();
				return (_("Please input a key word of domain name!"));
			}

			if (!re.test(url)) {
				$('#urlFilterAllow').focus();
				return (_("Please input a key word of domain name!"));
			}

			var trList = $("#urlList").children();
			for (i = 0; i < len; i++) {
				if (url == trList.eq(i).children().eq(1).find("div").text()) {
					$('#urlFilterAllow').focus();
					return (_("This is used. Try another."));
				}
			}

			if (len >= 32) {
				return (_("Up to %s entries can be added.", [32]));
			}
			return;
		}



		function addUrlList() {
			var url = $('#urlFilterAllow').val(),
				len = $("#urlList").children().length,
				i = 0;
			var msg = CheckUrlVolidate();

			if (msg) {
				top.mainLogic.showModuleMsg(msg);
				return;
			}

			var str = "";
			str += "<tr>";
			str += "<td align='center'>" + (len + 1) + "</td>";
			str += "<td><div class='span-fixed' style='width:200px;' title='" + url + "'>" + url + "</div></td>";
			str += '<td align="center"><div class="ico icon-minus-circled text-primary"></div></td>';
			$("#urlList").append(str);
			$('#urlFilterAllow').val('');
			top.mainLogic.initModuleHeight();

		}

		function deUrlList() { //删除URLlist
			var nextTr = $(this).parent().parent().nextAll(), //待删条目之后的所有条目
				len = nextTr.length; //待删条目之后的条目总数


			for (var i = 0; i < len; i++) {
				nextTr[i].children[0].innerHTML = parseInt(parseInt(nextTr[i].children[0].innerHTML)) - 1;
			}

			$(this).parent().parent().remove();
			top.mainLogic.initModuleHeight();
		}

		function getUrlListData() { //获取URL提交数据
			var str = "",
				i = 0,
				listArry = $("#urlList").children(),
				len = listArry.length;

			for (i = 0; i < len; i++) {
				str += $(listArry).eq(i).children().eq(1).find("div").text() + "\n";
			}
			str = str.replace(/[\n]$/, "");

			var msg = CheckUrlVolidate();

			if (!msg) {
				if (str != "") {
					str += "\n" + $('#urlFilterAllow').val();
				} else {
					str += $('#urlFilterAllow').val();
				}
				$('#urlFilterAllow').val('');
			} else {
				$('#urlFilterAllow')[0].blur();
			}
			return str;
		}

		function createUrlList(arry) { //生成URL 列表
			var i = 0,
				len = arry.length,
				str = "";
			for (i = 0; i < len; i++) {
				str += "<tr>";
				str += "<td align='center'>" + (i + 1) + "</td>";
				str += "<td><div class='span-fixed' style='width:200px;' title='" + arry[i] + "'>" + arry[i] + "</div></td>";
				str += '<td align="center"><div class="ico icon-minus-circled text-primary"></div></td>';
			}
			$("#urlList").html(str);
		}
	}
	/**************EDN Access Restrictions***************************/
})