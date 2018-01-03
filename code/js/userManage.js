define(function (require, exports, module) {
	var pageModule = new PageLogic({
		getUrl: "goform/getQos",
		modules: "localhost,onlineList,blackList",
		setUrl: "goform/setQos"
	});
	pageModule.modules = [];
	module.exports = pageModule;

	/********Attached Devices and Blocked Devices******************/

	var netCrlModule = new AttachedModule();
	pageModule.modules.push(netCrlModule);

	//获取禁止名单个数
	function getBlackLength() {
		var index = 0,
			i = 0,
			$listTable = $("#qosList").children(),
			length = $listTable.length,
			$blackTable = $("#qosListAccess").children(),
			blackLength = $blackTable.length,
			$td;

		//access
		if (length == 1 && $listTable.eq(0).children().length < 2) {

		} else {
			for (i = 0; i < length; i++) {
				$td = $listTable.eq(i).children();

				//判断是否关闭 或者上传或下载限制为0
				if ($td.eq(3).children().hasClass("icon-toggle-off")) {
					index++;
				}
			}
		}

		//black
		if (blackLength == 1 && $blackTable.eq(0).children().length < 2) {

		} else {
			for (i = 0; i < blackLength; i++) {
				if ($blackTable.eq(i).css("display") != "none") { //没有隐藏
					index++;
				}
			}
		}
		return index;

	}

	pageModule.beforeSubmit = function () {
		if (getBlackLength() > 10) {
			top.mainLogic.showModuleMsg(_("Up to %s devices can be added to blacklist.", [10]));
			return false;
		}
		return true;
	}

	function AttachedModule() {


		var timeFlag,
			refreshDataFlag = true,
			dataChanged;

		var that = this;

		this.data = {};

		this.moduleName = "qosList";

		this.init = function () {
			dataChanged = false;
			this.initEvent();
		}
		this.initEvent = function () {
			$("#qosList").delegate(".icon-edit", "click", editDeviceName);

			$("#qosList").delegate(".icon-toggle-on, .icon-toggle-off", "click", clickAccessInternet);

			$("#qosList").delegate(".edit-old", "blur", function () {
				$(this).parent().prev().attr("title", $(this).val());
				$(this).parent().prev().text($(this).val());
				$(this).parent().hide();
				$(this).parent().prev().show();
				$(this).parent().next().show();
			});

			$("#qosListAccess").delegate(".del", "click.dd", function (evnet) {
				var e = evnet || window.event;
				$(this).parent().parent().css("display", "none");
				dataChanged = true;
				//return;
			});

			//限制输入字节数不超过63
			$("#qosList").delegate(".setDeviceName", "keyup", function () {
				var deviceVal = this.value,
					len = deviceVal.length, //输入总字符数
					totalByte = getStrByteNum(deviceVal); //输入总字节数

				if (totalByte > 63) {
					for (var i = len - 1; i > 0; i--) {
						totalByte = totalByte - getStrByteNum(deviceVal[i]); //每循环一次，总字节数就减去最后一个字符的字节数

						if (totalByte <= 63) { //直到总字节数小于等于63，i值就是边界字符的下标
							this.value = deviceVal.slice(0, i);
							break;
						}
					}
				}

			});

		};
		this.initValue = function () {
			this.data = pageModule.data;

			timeFlag = setTimeout(function () {
				refreshTableList();
			}, 5000);

			$("#qosList").html(""); //
			$("#qosListAccess").html(""); //受限制table
			createOnlineList(this.data);
		};

		/**
		 * @method createOnlineList [创建在线及离线显示列表]
		 * @param  {Object} obj [对象中包含本机IP地址， 在线列表，黑名单列表]
		 */
		function createOnlineList(obj) {
			var i = 0,
				k = 0,
				str = "",
				limitStr = "",
				onlineListlen, blackListLen,
				prop, divElem, tdElem, trElem, upLimit, downLimit,
				localhostIP, hostname, connectType, ipStr, nativeHost; //nativeHost变量表示是否是本机


			localhostIP = obj.localhost.localhost;

			obj.onlineList = reCreateObj(obj.onlineList, "qosListIP", "up");

			//将本机添加到数组首位
			for (var i = 0; i < obj.onlineList.length; i++) {
				if (obj.onlineList[i].qosListIP == localhostIP) {
					var local = obj.onlineList[i];
					obj.onlineList.splice(i, 1);
					obj.onlineList.unshift(local);
					break;
				}
			}
			obj.blackList = reCreateObj(obj.blackList, "qosListIP", "up");
			onlineListlen = obj.onlineList.length;
			blackListLen = obj.blackList.length;

			//初始化在线列表
			for (i = 0; i < onlineListlen; i++) {
				str = "<tr class='addListTag'>"; //类只为初始化与赋值，用完就删除
				for (prop in obj.onlineList[i]) {
					if (obj.onlineList[i].qosListRemark != "") {
						hostname = obj.onlineList[i].qosListRemark;
					} else {
						hostname = obj.onlineList[i].qosListHostname;
					}

					//如果localhostIP == qosListIP，则代表本机
					if (localhostIP == obj.onlineList[i].qosListIP) {
						nativeHost = true;
					} else {
						nativeHost = false;
					}

					if (obj.onlineList[i].qosListConnectType == "wifi") {
						connectType = "icon-wireless";
					} else {
						connectType = "icon-wired";
					}

					if (localhostIP == obj.onlineList[i].qosListIP) {
						ipStr = obj.onlineList[i].qosListIP + _("(Native Device)");
					} else {
						ipStr = obj.onlineList[i].qosListIP;
					}
					if (prop == "qosListHostname") { //主机名
						str += '<td>';
						str += '<div class="col-xs-10 span-fixed deviceName"></div>';
						str += '<div class="col-xs-10 none">';
						str += ' <input type="text" class="form-control setDeviceName" value="" maxLength="63">';
						str += '</div>';
						str += '<div class="col-xs-2 row"> <span class="ico-small icon-edit"></span> </div>';

						str += '</td>';
					} else if (prop == "qosListConnectType" || prop == "qosListMac") {
						//在此处增加width:10%是为了规避由于上、下载数值较小时头部文字出现换行；
						if (prop == "qosListConnectType") {
							str += '<td class="span-fixed hidden-max-md" style="width:10%;text-align:center">';
						} else if (prop == "qosListMac") {
							str += '<td class="span-fixed hidden-max-sm" style="width:10%;text-align:center">';
						}
						if (obj.onlineList[i][prop] == "wifi") {
							str += '<span class="icon-wireless icon-small" ></span>';
						} else if (obj.onlineList[i][prop] == "wires") {
							str += '<span class="icon-wired icon-small" ></span>';
						} else {
							str += '<span>' + obj.onlineList[i][prop] + '</span>';
						}
						str += '</td>';
					} else if (prop == "qosListAccess") {
						str += '<td style="text-align:center">';
						if (nativeHost) {
							str += "<span class='nativeHost'>" + _("Native Host") + "<span>"
						} else {
							str += "<div class='switch icon-toggle-on'></div>";
						}
						str += '</td>';
					}
				}
				str += '</tr>';
				$("#qosList").append(str);
				$("#qosList .addListTag").find(".deviceName").text(_(hostname)); //主机名赋值
				$("#qosList .addListTag").find(".deviceName").attr("title", _(hostname));
				$("#qosList .addListTag").find(".setDeviceName").val(_(hostname));
				$("#qosList .addListTag").find(".setDeviceName").attr("data-mark", obj.onlineList[i].qosListHostname); //绑定主机名
				$("#qosList .addListTag").find(".setDeviceName").attr("alt", obj.onlineList[i].qosListMac.toUpperCase()); //绑定mac



				$("#qosList").find(".addListTag").removeClass("addListTag");



			} //end

			//初始化黑名单列表
			for (k = 0; k < blackListLen; k++) {
				str = "<tr class='addListTag'>";
				str += "<td class='deviceName'><div class='col-xs-11 span-fixed'>";
				str += "</div></td>";
				str += "<td class='hidden-max-sm'>" + obj.blackList[k].qosListMac.toUpperCase() + "</td>";

				str += "<td style='text-align:center'>";
				str += '<input type="button" class="del btn" value="' + _("Remove") + '">';
				str += "</td>";
				str += "</tr>";
				$("#qosListAccess").append(str);
				if (obj.blackList[k].qosListRemark != "") {
					hostname = obj.blackList[k].qosListRemark;
				} else {
					hostname = obj.blackList[k].qosListHostname;
				}

				$("#qosListAccess .addListTag").find(".deviceName div").text(hostname);
				$("#qosListAccess .addListTag").find(".deviceName").attr("data-mark", obj.blackList[k].qosListHostname);
				$("#qosListAccess").find(".addListTag").removeClass("addListTag");
			} //end
			$("#qosDeviceCount").html("(" + $("#qosList").children().length + ")");
			if ($("#qosList").children().length == 0) {
				str = "<tr><td colspan='2'>" + _("No device") + "</td></tr>";
				$("#qosList").append(str);
			}

			$("#blockedDeviceCount").html("(" + $("#qosListAccess").children().length + ")");
			if ($("#qosListAccess").children().length == 0) {
				str = "<tr><td colspan='2'>" + _("No device") + "</td></tr>";
				$("#qosListAccess").append(str);
			}

			top.mainLogic.initModuleHeight();
		}

		this.checkData = function () { //数据验证
			var deviceName = "",
				$listTable = $("#qosList").children(),
				length = $listTable.length,
				$td,
				upLimit,
				downLimit,
				i = 0;
			if (length == 1 && $listTable.eq(0).children().length < 2) {
				return;
			}
			for (i = 0; i < length; i++) {
				$td = $listTable.eq(i).children();
				deviceName = $td.find("input").eq(0).val(); //device name

				if (deviceName.replace(/[ ]/g, "") == "") {
					$td.find("input").eq(0).focus();
					return _("Space is not supported in a password!");
				}

			}
			return;
		};

		this.getSubmitData = function () { //获取提交数据
			var data = {},
				list,
				blockedData = getBlockedList(), //禁止
				attachedData = getAttacheList(); //允许
			list = attachedData;
			if (blockedData.permit.length > 0) {
				list += "\n" + blockedData.permit;
			}
			if (blockedData.forbid.length > 0) {
				list += "\n" + blockedData.forbid;
			}

			data = {
				module1: this.moduleName,
				qosList: list
			}
			return objToString(data);
		};


		function refreshTableList() {
			$.get("goform/getQos?" + getRandom() + encodeURIComponent("&modules=localhost,onlineList,blackList"), updateTable);

			if (!refreshDataFlag || dataChanged) {
				clearTimeout(timeFlag);
				return;
			}
			clearTimeout(timeFlag);
			timeFlag = setTimeout(function () {
				refreshTableList();
			}, 5000);
			if (!pageModule.pageRunning) {
				clearTimeout(timeFlag);
			}
		}

		/*
		 *
		 * @method updateTable 处理获取到的在线列表数据：
		 *    1、如果用户手动修改了当前在线列表数据，则保持不变；如果当前在线列表数据在CGI有更新，则针对该数据进行更新。
		 *    2、如果CGI有新增的在线条目，则append至在线列表里面
		 *    3、如果CGI有删除的在线条目，则将在线列表里面的数据删除
		 * @param {Object} 对象中包含本机，在线列表，黑名单列表数据
		 * @return {Array} 由本机IP、在线列表、黑名单列表组合成的数组
		 *
		 */
		function updateTable(obj) {
			if (checkIsTimeOut(obj)) {
				top.location.reload(true);
			}
			try {
				obj = $.parseJSON(obj);
			} catch (e) {
				obj = {};
			}

			if (isEmptyObject(obj)) {
				top.location.reload(true);
				return;
			}

			if (!pageModule.pageRunning || dataChanged) {
				return;
			}
			var getOnlineList = obj.onlineList;

			var $onlineTbodyList = $("#qosList").children(),
				onlineTbodyLen = $onlineTbodyList.length,
				getOnlineLen = getOnlineList.length,
				j = 0,
				i = 0,
				oldMac, newMac;

			var rowData = new Array(onlineTbodyLen);
			var refreshObj = new Array(getOnlineLen);
			var newDataArray = [];

			for (i = 0; i < getOnlineLen; i++) {
				newMac = getOnlineList[i].qosListMac.toUpperCase();
				refreshObj[i] = {};
				for (j = 0; j < onlineTbodyLen; j++) {
					//TODO : ReasyJS不能对空对象进行操作, 如： 全部被拦截上网的情况
					var $input = $onlineTbodyList.eq(j).children().eq(0).find("input")
					if ($input[0]) {
						oldMac = $input.eq(0).attr("alt").toUpperCase();
					} else {
						oldMac = '';
					}

					if (oldMac == newMac) { //存在
						rowData[j] = {};
						if ($onlineTbodyList.eq(j).children().eq(5).children().hasClass("icon-toggle-on")) { //当前为允许时
							$onlineTbodyList.eq(j).children().eq(2).find("span").eq(1).html(shapingSpeed(getOnlineList[i].qosListUpSpeed));

							$onlineTbodyList.eq(j).children().eq(1).find("span").eq(1).html(shapingSpeed(getOnlineList[i].qosListDownSpeed));
						}
						rowData[j].refresh = true; //
						refreshObj[i].exist = true;
					}
					if ($onlineTbodyList.eq(i).children().eq(0).find("input").eq(0).hasClass("edit-old")) { //已编辑过的不能删除
						rowData[j] = {};
						rowData[j].refresh = true;
					}
				}
			}

			for (i = 0; i < getOnlineLen; i++) {
				if (!refreshObj[i].exist) {
					newDataArray.push(getOnlineList[i]); //新增
				}
			}

			for (j = 0; j < onlineTbodyLen; j++) {
				if (!rowData[j] || !rowData[j].refresh) {
					//将在线列表中当前已经不在线的设备删除
					$onlineTbodyList.eq(j).remove();
				}
			}

			//清除黑名单列表中显示的数据，重新初始化
			$("#qosListAccess").html("");
			obj.onlineList = newDataArray;
			createOnlineList(obj);
		};

		function editDeviceName() {
			var deviceName = $(this).parent().prev().prev().text(),
				reMarkMaxLength = "";
			$(this).parent().prev().prev().hide(); //隐藏用户名
			$(this).parent().hide(); //隐藏编辑
			$(this).parent().prev().show();
			$(this).parent().prev().find("input").addClass("edit-old"); //编辑时给编辑元素增加类标志
			reMarkMaxLength = $(this).parent().prev().find("input").attr("maxLength");
			$(this).parent().prev().find("input").val(deviceName.substring(0, reMarkMaxLength));
			$(this).parent().prev().find("input").focus();
		}

		function clickAccessInternet() {
			var className = this.className;
			if (className == "switch icon-toggle-on") {

				if (getBlackLength() >= 10) {
					top.mainLogic.showModuleMsg(_("Up to %s devices can be added to blacklist.", [10]));
					return;
				}
				this.className = "switch icon-toggle-off";
			} else {
				this.className = "switch icon-toggle-on";
			}
		}

		//获取在线列表数据
		function getAttacheList() {
			var str = "",
				$listTable = $("#qosList").children(),
				length = $listTable.length,
				$td,
				upLimit,
				downLimit,
				hostname,
				internetAccess,
				i = 0;
			if (length == 1 && $listTable.eq(0).children().length < 2) {
				return "";
			}
			for (i = 0; i < length; i++) {
				$td = $listTable.eq(i).children();
				internetAccess = $td.eq(3).children().hasClass("icon-toggle-on");
				str += $td.find("input").eq(0).attr("data-mark") + "\t"; //主机名
				if ($td.find("input").eq(0).val() == $td.find("input").eq(0).attr("data-mark")) { //主机名与备注一样
					str += "" + "\t";
				} else {
					str += $td.find("input").eq(0).val() + "\t"; //备注名
				}
				str += $td.find("input").eq(0).attr("alt") + "\t"; //mac


				//补充两个“38258”,保证数据格式正确
				str += "38258" + "\t" + "38258" + "\t";

				//当接入控制选项为“本机”或者按钮为开启是，传值设为"true"
				if ($td.eq(3).children().hasClass("icon-toggle-on") || $td.eq(3).children().hasClass("nativeHost")) {
					str += "true" + "\n";
				} else {
					str += "false" + "\n";
				}

			}
			str = str.replace(/[\n]$/, "");
			return str
		}

		//获取禁止列表数据 
		function getBlockedList() {
			var permitStr = "",
				forbidStr = "",
				hostname,
				data = {},
				$listTable = $("#qosListAccess").children(),
				length = $listTable.length,
				i = 0;
			//暂无设备时
			if (length == 1 && $listTable.eq(0).children().length < 2) {
				data = {
					permit: "",
					forbid: ""
				}
				return data;
			}
			for (i = 0; i < length; i++) {
				if ($listTable.eq(i).css("display") == "none") { //允许访问
					hostname = $listTable.eq(i).children().eq(0).attr("data-mark");
					permitStr += hostname + "\t";
					if (hostname == $listTable.eq(i).children().eq(0).text()) {
						permitStr += "\t";
					} else {
						permitStr += $listTable.eq(i).children().eq(0).text() + "\t"; //device name
					}
					permitStr += $listTable.eq(i).children().eq(1).text() + "\t"; //mac
					permitStr += "38528" + "\t";
					permitStr += "38528" + "\t";
					permitStr += "true" + "\n";
				} else { //拒绝访问
					hostname = $listTable.eq(i).children().eq(0).attr("data-mark");

					forbidStr += hostname + "\t"; //device name
					if (hostname == $listTable.eq(i).children().eq(0).text()) {
						forbidStr += "\t";
					} else {
						forbidStr += $listTable.eq(i).children().eq(0).text() + "\t"; //device name
					}
					forbidStr += $listTable.eq(i).children().eq(1).text() + "\t"; //mac
					forbidStr += "0" + "\t";
					forbidStr += "0" + "\t";
					forbidStr += "false" + "\n";
				}
			}
			data = {
				permit: permitStr.replace(/[\n]$/, ""),
				forbid: forbidStr.replace(/[\n]$/, "")
			}
			return data;
		}
	}
	/********END Attached Devices and Blocked Devices ************************/
})