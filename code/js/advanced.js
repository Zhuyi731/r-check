define(function (require, exports, module) {

	var pageModule = new PageLogic({
		getUrl: "goform/getNAT",
		modules: "staticIPList,portList,ddns,dmz,upnp,lanCfg",
		setUrl: "goform/setNAT"
	});

	pageModule.initEvent = function () {
		pageModule.update("ddns", 2e3, updateDDNSStatus)
	};

	function updateDDNSStatus(obj) {
		showConnectStatus(obj.ddns.ddnsStatus);
	}
	pageModule.modules = [];
	module.exports = pageModule;

	/*
	 * @method staticModule [显示及设置静态IP地址]
	 */
	var staticModule = new StaticModule();
	pageModule.modules.push(staticModule);

	function StaticModule() {
		var that = this;

		this.moduleName = "staticIPList";

		this.init = function () {
			this.initEvent();
		};
		this.initEvent = function () {
			$("#staticHead").delegate(".icon-plus-circled", "click", addStaticList);
			$("#staticTbody").delegate(".icon-minus-circled", "click", delStaticList)

			$("#staticHead").delegate("#staticRemark", "keyup", function () {
				var deviceVal = this.value,
					len = deviceVal.length, //输入总字符数
					totalByte = getStrByteNum(deviceVal); //输入总字节数

				if (totalByte > 63) {
					for (var i = len - 1; i > 0; i--) {
						totalByte = totalByte - getStrByteNum(deviceVal[i]); //每循环一次，总字节数就减去最后一个字符的字节数，

						if (totalByte <= 63) { //直到总字节数小于等于63，i值就是边界值的下标
							this.value = deviceVal.slice(0, i);
							break;
						}
					}
				}
			});
		};
		this.initValue = function (staticIPListArray) {
			var i = 0,
				len = staticIPListArray.length;
 
			//重置
			$("#staticIp, #staticMac, #staticRemark").val("");
			$("#staticTbody").html("");

			//表格初始化
			for (i = 0; i < len; i++) {
				listStr = "";
				listStr += "<tr>";
				listStr += '<td class="span-fixed">' + staticIPListArray[i].staticIP + "</td>";
				listStr += '<td class="span-fixed">' + staticIPListArray[i].staticMac.toUpperCase() + "</td>";
				listStr += '<td class="span-fixed remark"></td>';
				listStr += "<td><div class='ico icon-minus-circled text-primary'></div></td>";
				listStr += "</tr>";
				$("#staticTbody").append(listStr);
				$("#staticTbody").find(".remark").text(staticIPListArray[i].staticRemark);
				$("#staticTbody").find(".remark").removeClass("remark");
			}
		};

		this.checkData = function () {
			return;
		};
		this.getSubmitData = function () {
			var data = {
				module1: that.moduleName,
				staticList: getStaticValue()
			}
			return objToString(data);
		};

		function checkAddStaticValidate() {
			var staticIP = $("#staticIp").val(),
				mac = $("#staticMac").val(),
				lanCfgObj = pageModule.data.lanCfg,
				startIP = lanCfgObj.lanDhcpStartIP,
				endIP = lanCfgObj.lanDhcpEndIP,
				lanIP = lanCfgObj.lanIP,
				lanMask = lanCfgObj.lanMask;

			if (!(/^([1-9]|[1-9]\d|1\d\d|2[0-1]\d|22[0-3])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/).test(staticIP)) {
				$("#staticIp").focus();
				return _("Please input a valid IP address.");
			}
			if (!checkIpInSameSegment(staticIP, lanMask, lanIP, lanMask)) {
				$("#staticIp").focus();
				return _("%s and %s must be in the same network segment.", [_("Static IP"), _("LAN IP")]);
			}

			var msg = checkIsVoildIpMask(staticIP, lanMask, _("Static IP"));
			if (msg) {
				$("#staticIp").focus();
				return msg;
			}

			if (staticIP == lanIP) {
				$("#staticIp").focus();
				return _("Static IP should not be the same with the LAN IP");
			}

			var ipArry = staticIP.split("."),
				sipArry = startIP.split("."),
				eipArry = endIP.split("."),
				ipNumber,
				sipNumber,
				eipNumber;
			ipNumber = parseInt(ipArry[0], 10) * 256 * 256 * 256 + parseInt(ipArry[1], 10) * 256 * 256 + parseInt(ipArry[2], 10) * 256 + parseInt(ipArry[3], 10);
			sipNumber = parseInt(sipArry[0], 10) * 256 * 256 * 256 + parseInt(sipArry[1], 10) * 256 * 256 + parseInt(sipArry[2], 10) * 256 + parseInt(sipArry[3], 10);
			eipNumber = parseInt(eipArry[0], 10) * 256 * 256 * 256 + parseInt(eipArry[1], 10) * 256 * 256 + parseInt(eipArry[2], 10) * 256 + parseInt(eipArry[3], 10);
			// if (ipNumber < sipNumber || ipNumber > eipNumber) {
			// 	$("#staticIp").focus();
			// 	return _("IP address must be included in the address pool of DHCP");
			// }

			if (!(/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/).test(mac) && !(/^([0-9a-fA-F]{2}-){5}[0-9a-fA-F]{2}$/).test(mac)) {
				$("#staticMac").focus();
				return _("Please input a valid MAC address.");
			}
			mac = mac.replace(/[-]/g, ":");
			var subMac1 = mac.split(':')[0];

			if (subMac1.charAt(1) && parseInt(subMac1.charAt(1), 16) % 2 !== 0) {
				$("#staticMac").focus();
				return _('The second character must be even number.');
			}
			if (mac === "00:00:00:00:00:00") {
				$("#staticMac").focus();
				return _('MAC can not be 00:00:00:00:00:00.');
			}

			var $listArry = $("#staticTbody").children(),
				len = $listArry.length,
				i = 0,
				listMac,
				listIp;
			for (i = 0; i < len; i++) {
				listIp = $listArry.eq(i).children().eq(0).html();
				listMac = $listArry.eq(i).children().eq(1).html();
				if (staticIP == listIp) {
					$("#staticIp").focus();
					return _("This IP address is used. Please try another.");
				}
				if (listMac.toUpperCase() == mac.toUpperCase()) {
					$("#staticMac").focus();
					return _("This MAC address is used. Please try another.");
				}
			}
			if ($("#staticTbody").children().length >= 20) {
				return (_("Up to %s entries can be added.", [20]));

			}
			return;
		}

		function delStaticList() {
			$(this).parent().parent().remove();
			top.mainLogic.initModuleHeight();
		}

		function addStaticList() {
			var msg = checkAddStaticValidate(),
				str;
			if (msg) {
				mainLogic.showModuleMsg(msg);
				return;
			}
			str = "<tr>";
			str += '<td class="span-fixed">' + $("#staticIp").val() + "</td>";
			str += '<td class="span-fixed">' + $("#staticMac").val().replace(/[-]/g, ":").toUpperCase() + "</td>";
			str += '<td class="span-fixed">' + $("#staticRemark").val() + "</td>";
			str += "<td><div class='ico icon-minus-circled text-primary'></div></td>";
			str += "</tr>";
			$("#staticTbody").append(str);
			$("#staticIp").val('');
			$("#staticMac").val('');
			$("#staticRemark").val('');
			top.mainLogic.initModuleHeight();
		}

		function getStaticValue() {
			var str = "",
				i = 0,
				$staticArry = $("#staticTbody").children(),
				length = $staticArry.length;


			for (i = 0; i < length; i++) {
				str += $staticArry.eq(i).children().eq(0).html() + "\t";
				str += $staticArry.eq(i).children().eq(1).html().toUpperCase() + "\t";
				str += $staticArry.eq(i).children().eq(2).text() + "\t";
				str += "\n";
			}
			str = str.replace(/[\n]$/, "");

			var msg = checkAddStaticValidate();
			//判断没有错误时
			if (!msg) {
				if (str != "") {
					str += "\n" + $("#staticIp").val() + "\t";
				} else {
					str += $("#staticIp").val() + "\t";
				}
				str += $("#staticMac").val().replace(/[-]/g, ":") + "\t";
				str += $("#staticRemark").val();

				$("#staticIp").val('');
				$("#staticMac").val('');
				$("#staticRemark").val('');
			} else { //验证添加数据错误时
				$("#staticIp")[0].blur();
				$("#staticMac")[0].blur();
			}
			return str;
		}
	}

	/**********END static IP***********/

	/*
	 * 显示及设置端口映射列表数据的模块
	 * @method portMap
	 * @param {Array} portListArray 从后台获取的端口映射列表数据
	 * @return {无}
	 */
	var portMap = new PortMapModule();
	pageModule.modules.push(portMap);

	function PortMapModule() {
		var that = this,
			G_outPort;

		var toSyncLanPort = true,
			toSyncWanPort = true;

		this.moduleName = "portList";
		this.init = function () {
			this.initEvent();
		};
		this.initEvent = function () {

			$.validate.valid.ddns = function (str) {
				var ret;
				ret = $.validate.valid.ascii(str);
				if (ret) {
					return ret;
				}
				ret = $.validate.valid.remarkTxt(str, ";");
				if (ret) {
					return ret;
				}
			};
			$("#portHead").delegate(".icon-plus-circled", "click", addPortList);//添加之后重置
			$("#portTbody").delegate(".icon-minus-circled", "click", delPortList);

			/******添加事件，只能输入数字******/
			$("#internalPort0, #externalPort0, #internalPort1, #externalPort1").on("keyup", function () {
				this.value = (parseInt(this.value, 10) || "")
			});

			$("#internalPort0, #externalPort0, #internalPort1, #externalPort1").on("blur", function () {
				this.value = (parseInt(this.value, 10) || "")
			});

			$("#internalPort0").on("keyup", function () {
				if (toSyncLanPort && $(this).val() != "") {
					$("#internalPort1").val($(this).val());
				}
			}).on("blur", function () {
				toSyncLanPort = false;
			});

			$("#externalPort0").on("keyup", function () {
				if (toSyncWanPort && $(this).val() != "") {
					$("#externalPort1").val($(this).val());
				}
			}).on("blur", function () {
				toSyncWanPort = false;
			});


		};

		//初始化数据列表
		this.initValue = function (portListArray) {
			//inputValue(obj);
			var listArry = portListArray,
				len = listArry.length,
				i = 0,
				str = "";

			G_outPort = portListArray;
			//重置;
			$("#internalIP, #internalPort0, #internalPort1, #externalPort0, #externalPort1").val("");
			$("#protocol").val("both");
			$("#portTbody").html("");
			// $("#internalPort0,#externalPort0").addPlaceholder(_("Start port"));
			// $("#internalPort1,#externalPort1").addPlaceholder(_("End port"));
			// $(".placeholder-content").css("display","inline-block");

			//初始化表格
			for (i = 0; i < len; i++) {
				str += "<tr>";
				str += "<td>" + listArry[i].portListIntranetIP + "</td>";
				str += "<td data-inPort='"+listArry[i].portListIntranetPort0 + ";" + listArry[i].portListIntranetPort1+"'>" + listArry[i].portListIntranetPort0 + "~" + listArry[i].portListIntranetPort1 + "</td>";
				str += "<td data-outPort='"+listArry[i].portListExtranetPort0 + ";" + listArry[i].portListExtranetPort1+"'>" + listArry[i].portListExtranetPort0 + "~" + listArry[i].portListExtranetPort1 + "</td>";
				str += "<td data-val='" + listArry[i].portListProtocol + "'>" + $("#protocol [value='" + listArry[i].portListProtocol + "']").html() + "</td>";
				str += "<td><div class='ico icon-minus-circled text-primary' titile='" + _("Delete") + "'></div></td>";
				str += "</tr>";
			}
			$("#portTbody").html(str);
		};

		this.checkData = function () {
			return;
		};

		this.getSubmitData = function () {
			var data = {
				module2: that.moduleName,
				portList: getPortListValue()
			};
			return objToString(data);
		};

		/*******检查添加时的数据合法性*******/
		function checkAddListValidate() {
			var protocol = $("#protocol").val(),
				inIp = $("#internalIP").val(),
				inPort0 = $("#internalPort0").val(),
				inPort1 = $("#internalPort1").val(),
				outPort0 = $("#externalPort0").val(),
				outPort1 = $("#externalPort1").val(),
				lanIP = pageModule.data.lanCfg.lanIP,
				lanMask = pageModule.data.lanCfg.lanMask;

			var i = 0,
				k = 0,
				portArry = $("#portTbody").children(),
				length = portArry.length,
				existedProtocol = "",
				existExternalPort0 = "",
				existExternalPort1 = "";

			if ($("#portTbody").children().length >= 16) {
				return (_("Up to %s entries can be added.", [16]));
			}

			//判断IP地址合法性
			if (!(/^([1-9]|[1-9]\d|1\d\d|2[0-1]\d|22[0-3])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/).test(inIp)) {
				$("#internalIP").focus();
				return _("Please input a valid IP address.");
			}

			if (!checkIpInSameSegment(inIp, lanMask, lanIP, lanMask)) {
				$("#internalIP").focus();
				return _("%s and %s must be in the same network segment.", [_("Internal IP"), _("LAN IP")]);
			}

			var msg = checkIsVoildIpMask(inIp, lanMask, _("Internal IP"));
			if (msg) {
				$("#internalIP").focus();
				return msg;
			}

			if (inIp == lanIP) {
				return (_("Internal IP should not be the same with the login IP(%s)", [lanIP]));
			}

			if (inPort0 == "" || parseInt(inPort0, 10) > 65535 || parseInt(inPort0, 10) < 1) {
				$("#internalPort0").focus();
				return (_("Internal Port Range: 1-65535"));
			}

			if (inPort1 == "" || parseInt(inPort1, 10) > 65535 || parseInt(inPort1, 10) < 1) {
				$("#internalPort1").focus();
				return (_("Internal Port Range: 1-65535"));
			}

			//结束端口要大于起始端口
			if(parseInt(inPort0, 10) > parseInt(inPort1, 10)) {
				$("#internalPort1").focus();
				return (_("The ending port should be greater than the starting port!"));
			}

			if (outPort0 == "" || parseInt(outPort0, 10) > 65535 || parseInt(outPort0, 10) < 1) {
				$("#externalPort0").focus();
				return (_("External Port Range: 1-65535"));
			}

			if (outPort1 == "" || parseInt(outPort1, 10) > 65535 || parseInt(outPort1, 10) < 1) {
				$("#externalPort1").focus();
				return (_("External Port Range: 1-65535"));
			}

			//结束端口要大于起始端口
			if(parseInt(outPort0, 10) > parseInt(outPort1, 10)) {
				$("#externalPort1").focus();
				return (_("The ending port should be greater than the starting port!"));
			}

			/*for (k = 0; k < length; k++) { 
				existExternalPort0 = G_outPort[k].portListExtranetPort0;
				existExternalPort1 = G_outPort[k].portListExtranetPort1;
				if (!(outPort0 > existExternalPort1 || outPort1 < existExternalPort0)) {
					return _("The range of external port overlaps with existed rule partly or wholly.");
				}
			}*/
			//冲突条目检测
			for (k = 0; k < length; k++) {
				var existedExtPort = portArry.eq(k).children().eq(2).attr("data-outport").split(";"),
					existedInPort = portArry.eq(k).children().eq(1).attr("data-inport").split(";");

				existedProtocol = portArry.eq(k).children().eq(3).attr("data-val");
				existExternalPort0 = existedExtPort[0];
				existExternalPort1 = existedExtPort[1];
				existInternalPort0 = existedInPort[0];
				existInternalPort1 = existedInPort[1];

				if ((protocol == "both" || protocol == existedProtocol || existedProtocol =="both") && !(outPort0 > existExternalPort1 || outPort1 < existExternalPort0)) {
					return (_("The range of external port overlaps with existed rule partly or wholly."));
				}

				//入口检查重复
				// if ((protocol == "both" || protocol == existedProtocol || existedProtocol =="both") && !(inPort0 > existInternalPort1 || inPort1 < existInternalPort0)) {
				// 	return _("The range of internal port overlaps with existed rule partly or wholly.");
				// }
			}

			//outPort1 - outPort0 = inPort1 - inPort0
			if((parseInt(outPort1, 10) - parseInt(outPort0, 10)) !== (parseInt(inPort1, 10) - parseInt(inPort0, 10))){
				$("#externalPort1").focus();
				return (_("The range of Internal Port and External Port should be the same!"));
			}

			return;
		}

		function addPortList() {
			var str = "";
			var inIp = $("#internalIP").val(),
				inPort0 = $("#internalPort0").val(),
				inPort1 = $("#internalPort1").val(),
				outPort0 = $("#externalPort0").val(),
				outPort1 = $("#externalPort1").val(),
				protocol = $("#protocol").val();
			var msg = checkAddListValidate();
			if (msg) {
				mainLogic.showModuleMsg(msg);
				return;
			}

			str += "<tr>";
			str += "<td>" + inIp + "</td>";
			str += "<td data-inPort='"+ inPort0 + ";" + inPort1 +"'>" + inPort0 + "~" + inPort1 + "</td>";
			str += "<td data-outPort='"+ outPort0 + ";" + outPort1 +"'>" + outPort0 + "~" + outPort1 + "</td>";
			str += "<td data-val='" + protocol + "'>" + $("#protocol option:selected").html() + "</td>";
			str += "<td><div class='ico icon-minus-circled text-primary'></div></td>";
			str += "</tr>";
			$("#portTbody").append(str);
			$("#internalIP,#internalPort0,#internalPort1,#externalPort0,#externalPort1").val('');
			top.mainLogic.initModuleHeight();
			toSyncLanPort = true;
			toSyncWanPort = true;
		
		}

		/******获取table表格提交的字符串*********/
		function getPortListValue() {
			var str = "",
				i = 0,
				$portArry = $("#portTbody").children(),
				length = $portArry.length;

			var inIp = $("#internalIP").val(),
				inPort0 = $("#internalPort0").val(),
				inPort1 = $("#internalPort1").val(),
				outPort0 = $("#externalPort0").val(),
				outPort1 = $("#externalPort1").val(),
				protocol = $("#protocol").val();

			for (i = 0; i < length; i++) {
				str += $portArry.eq(i).children().eq(0).html() + ";";
				str += $portArry.eq(i).children().eq(1).attr("data-inPort") + ";";
				str += $portArry.eq(i).children().eq(2).attr("data-outPort") + ";";
				str += $portArry.eq(i).children().eq(3).attr("data-val");
				str += "~";
			}
			str = str.replace(/[~]$/, "");

			var msg = checkAddListValidate();

			//判断合法时
			if (!msg) {
				if (str != "") {
					str += "~" + inIp + ";" + inPort0 + ";" + inPort1 + ";" + outPort0 + ";" + outPort1 + ";" + protocol;
				} else {
					str += inIp + ";" + inPort0 + ";" + inPort1 + ";" + outPort0 + ";" + outPort1 + ";" + protocol;
				}
				$("#internalIP").val('');
			} else {
				$("#internalIP")[0].blur();
				$("#externalPort0")[0].blur();
				$("#internalPort0")[0].blur();
				$("#externalPort1")[0].blur();
				$("#internalPort1")[0].blur();
			}

			return str;
		}

		function delPortList() {
			$(this).parent().parent().remove();
			top.mainLogic.initModuleHeight();
		}
	}
	/********END  Port Forwarding******************/



	/*
	 * 显示及设置DMZ数据的模块
	 * @method dmzModule
	 * @param {Object} dmzObj 从后台获取的端口映射列表数据
	 * @return {无}
	 */
	var dmzModule = new DmzModule();
	pageModule.modules.push(dmzModule);

	function DmzModule() {
		var that = this;
		this.moduleName = "dmz";

		this.init = function () {
			this.initEvent();
		};
		this.initEvent = function () {
			$("input[name='dmzEn']").on("click", changeDmzEn);
		};
		this.initValue = function (dmzObj) {

			//重置
			$("#dmzHostIP").removeValidateTipError(true);

			$("input[name='dmzEn'][value='" + dmzObj.dmzEn + "']")[0].checked = true;
			$("#dmzHostIP").val(dmzObj.dmzHostIP || "");
			changeDmzEn();
		};
		this.checkData = function () {
			var dmzIP = $("#dmzHostIP").val(),
				lanIP = pageModule.data.lanCfg.lanIP,
				lanMask = pageModule.data.lanCfg.lanMask;
			if ($("input[name='dmzEn']")[0].checked) {
				//判断IP地址合法性
				if (!checkIpInSameSegment(dmzIP, lanMask, lanIP, lanMask)) {
					$("#dmzHostIP").focus();
					return _("%s and %s must be in the same network segment.", [_("Host IP"), _("LAN IP")]);
				}

				var msg = checkIsVoildIpMask(dmzIP, lanMask, _("Host IP"));
				if (msg) {
					$("#dmzHostIP").focus();
					return msg;
				}

				if (dmzIP == lanIP) {
					return _("DMZ host IP should not be the same with the login IP(%s)", [lanIP]);
				}
			}
			return;
		};
		this.getSubmitData = function () {
			var data = {
				module3: that.moduleName,
				dmzEn: $("input[name='dmzEn']:checked").val(),
				dmzHostIP: $("#dmzHostIP").val()
			}
			return objToString(data);
		};

		function changeDmzEn() {
			var dmzEn = $("input[name='dmzEn']:checked").val();
			if (dmzEn == "true") {
				$("#dmzWrap").removeClass("none");
			} else {
				$("#dmzWrap").addClass("none");
			}
			top.mainLogic.initModuleHeight();
		}
	}

	/*********END dmz*****/

	/*
	 * 显示及设置DDNS模块的数据
	 * @method ddnsModule
	 * @param {Object} ddnsObj 从后台获取的ddns数据
	 * @return {无}
	 */
	var ddnsModule = new DdnsModule();
	pageModule.modules.push(ddnsModule);

	function DdnsModule() {
		var that = this;
		this.moduleName = "ddns";
		this.data = {};
		this.init = function () {
			this.initEvent();
		};
		this.initEvent = function () {
			$("input[name='ddnsEn']").on("click", this.changeDdnsEn);
			$("#ddnsServiceName").on("change", this.changeDdnsServiceName);
			$("#register").on("click", function () {
				var url = $("#ddnsServiceName").val();
				window.open("http://" + url);
			});

			this.addInputEvent = false;
		};
		this.initValue = function (ddnsObj) {

			$("#ddnsUser, #ddnsPwd, #ddnsServer").removeValidateTipError(true);
			this.data = ddnsObj;
			//连接状态与联网状态的英文表述一致
			if ($('html').hasClass("lang-cn")) {
				$("#ddnsConnectionStatusInfo").html("连接状态");
			}

			//设置密码框为聚焦明文，失去焦点密文形式
			if (!this.addInputEvent) {
				$("#ddnsPwd").initPassword();
				this.addInputEvent = true;
			}

			inputValue(this.data);
			showConnectStatus(ddnsObj.ddnsStatus);
			this.changeDdnsEn();
			if ($("#ddnsServiceName").val() == "oray.org") {
				$("#ddnsDomain").addClass("none");
			} else {
				$("#ddnsDomain").removeClass("none");
			}
		};
		this.checkData = function () {
			return;
		};
		this.getSubmitData = function () {
			var data = {
				module4: that.moduleName,
				ddnsEn: $("input[name='ddnsEn']:checked").val(),
				ddnsServiceName: $("#ddnsServiceName").val(),
				ddnsServer: $("#ddnsServer").val(),
				ddnsUser: $("#ddnsUser").val(),
				ddnsPwd: $("#ddnsPwd").val()
			}
			return objToString(data);
		};

		this.changeDdnsServiceName = function () {
			var domainName = $("#ddnsServiceName").val();
			$("#ddnsUser, #ddnsPwd, #ddnsServer").removeValidateTipError(true);

			if (domainName == that.data.ddnsServiceName) {
				$("#ddnsUser").val(that.data.ddnsUser);
				$("#ddnsPwd").val(that.data.ddnsPwd);
				$("#ddnsServer").val(that.data.ddnsServer);
			} else {
				$("#ddnsUser").val("");
				$("#ddnsPwd").val("");
			}

			if (domainName == "oray.org") {
				$("#ddnsDomain").addClass("none");
			} else {
				$("#ddnsDomain").removeClass("none");
			}
			top.mainLogic.initModuleHeight();
		};

		this.changeDdnsEn = function () {
			var ddnsEn = $("input[name='ddnsEn']:checked").val();
			if (ddnsEn == "true") {
				$("#ddnsWrap").removeClass("none");
			} else {
				$("#ddnsWrap").addClass("none");
			}
			top.mainLogic.initModuleHeight();
		}
	}

	function showConnectStatus(status) {
		var str = "",
			strArr;
		if ($('html').hasClass("lang-cn")) {
			stArr = {
				Disconnected: "未连接",
				Connectting: "连接中",
				Connected: "已连接"
			};
		} else {
			stArr = {
				Disconnected: _("Disconnected"),
				Connectting: _("Connecting"),
				Connected: _("Connected")
			};
		}

		if (status == "Connected") {
			str = "text-success";
		} else if (status == "Connectting") {
			str = "text-primary";
		} else {
			str = "text-danger";
		}

		$("#ddnsStatus").attr("class", str).html(stArr[status]);
	}

	/******END ddns*******/

	/*
	 * 显示及设置UPNP模块的数据
	 * @method upnpModule
	 * @param {Object} upnpObj 从后台获取的ddns数据
	 * @return {无}
	 */
	var upnpModule = new UpnpModule();
	pageModule.modules.push(upnpModule);

	function UpnpModule() {
		var that = this;

		this.moduleName = "upnp";
		this.init = function () {
			this.initEvent();
		};
		this.initEvent = function () {

		};
		this.initValue = function (upnpObj) {
			inputValue(upnpObj);
		};
		this.checkData = function () {
			return;
		}
		this.getSubmitData = function () {
			var data = {
				module5: that.moduleName,
				upnpEn: $("input[name='upnpEn']:checked").val()
			};
			return objToString(data);
		}
	}

	/*********END upnp*******/
})