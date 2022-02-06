var ua = window.navigator.userAgent;
var currentHref = window.location.href;
var campaign = url.utm_campaign;
var term = url.utm_term;
var staticUrl = window.location.protocol+ (currentHref.indexOf("//test")>-1?"//test":"//");

// var m_url = "http://dqr.filstor.cn/";
// var m_url =staticUrl+ "dqr.filstor.cn/down/m/";

// // var pc_url = "http://dqr.filstor.cn/";
// var pc_url =staticUrl+ "dqr.filstor.cn/down/";

var browser = (function() {
	var ua = window.navigator.userAgent.toLowerCase();
	return {
		app : ua.indexOf("dmall") > -1,
		iOS : ua.indexOf("mac") > -1,
		iPhone : ua.indexOf("iphone") > -1,
		iPad : ua.indexOf("ipad") > -1,
		android : ua.indexOf("android") > -1,
		weChat : ua.indexOf("micromessenger") > -1
	};
})();
var constantCollect = {
	chars : ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
	success : "0000",
	loginId : browser.wx ? "ticketLoginId" : "loginId", //判断用户是否登录 or 微信是否绑定
	storeId : "store_id",
	venderId : "vender_id",
	cookieId : "cookie_id",
	ticketName : "ticketName",
	token : "token",
	ticketWeChat : "ticketWeChat", //微信商城下用户是否已经授权
	appos : "appos", //app
	wareType : {
		common : 1, //普通商品
		presale : 2 //预售商品
	}
},
    uuid = function() {
	var chars = constantCollect.chars,
	    uuid = new Array(36),
	    rnd = 0,
	    r;
	for (var i = 0; i < 36; i++) {
		if (i == 8 || i == 13 || i == 18 || i == 23) {
			uuid[i] = '-';
		} else if (i == 14) {
			uuid[i] = '4';
		} else {
			if (rnd <= 0x02)
				rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
			r = rnd & 0xf;
			rnd = rnd >> 4;
			uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
		}
	}
	return uuid.join('');
},
    getParameter = function(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"),
	    r = window.location.search.substr(1).match(reg);
	if (r)
		return unescape(r[2]);
	return "";
},
    getCookie = function(name) {
	var arr,
	    reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
	if ( arr = document.cookie.match(reg)) {
		return unescape(arr[2]);
	} else {
		return "";
	}
},
//向cookie中存入值，exp为失效时间，默认存30天
    setCookie = function(name, value, exp) {
	exp = exp || new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
	document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() + ";path=/;domain=.dmall.com";
	return value;
};
var collectData = function(path, data) {
	function sid(l) {
		var t = "",
		    i = 0,
		    l = l || 0,
		    r,
		    w = constantCollect.chars;
		for (; i < l; i++) {
			r = Math.ceil(61 * Math.random());
			t += w[r];
		}
		return t;
	}

	function buildPath(json) {
		var key,
		    paire = [],
		    json = json || {};
		for (key in json) {
			paire.push(key + "=" + encodeURIComponent(json[key]));
		}
		return paire.join("&");
	}

	function getData(path, d) {
		switch(path) {
		case "mweb/m_pv":
			return {
				url : document.URL,
				refer_url : document.referrer,
				latitude : "",
				longitude : "",
				ext : "byAct"
			};
		case "mweb/m_event_click":
			return {
				event_flag:2
			};
		default:
			return {};
		}
	}

	var baseData = {
		client_flag : browser.wx && "WeChat" || browser.iPhone && "iphone" || browser.android && "android" || "mweb",
		cookie_id : getCookie(constantCollect.cookieId) || setCookie(constantCollect.cookieId, new Date().getTime() + sid(5)),
		user_id : getCookie(constantCollect.loginId),
		pvid : uuid(),
		channel_id : getParameter("source_id"),
		venderid : getCookie(constantCollect.venderId),
		storeid : getCookie(constantCollect.storeId)
	},
	    request = new Image();
	request.src = window.location.protocol+"//collect.dmall.com/" + path + "?" + buildPath(baseData) + "&" + buildPath(getData(path, data));
};

function cd(){
	collectData("mweb/m_event_click");
}

collectData("mweb/m_pv");

window.onload=function(){
	if(browser.app || browser.weChat){
		return;
	}
	if(!browser.iOS && !browser.iPhone && !browser.iPad && !browser.android){
		return;
	}
	var url = getParameter("showInApp");
	if(!url){
		return;
	}
	url = decodeURIComponent(url);
	window.location.href = "dmall://dmall/" + url;
};
