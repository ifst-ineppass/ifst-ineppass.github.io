var channel_api = "#";

var os = {
    'android': ua.match(/(Android);?[\s\/]+([\d.]+)?/),
    'ios': ua.match(/(iPad|iPhone|iPod).*OS\s([\d_]+)/)
    //            'ipad': UA.match(/(iPad).*OS\s([\d_]+)/)
};
os.pc = !os.android && !os.ios;

var constant = {
    appStore: "#",
    apkPath: "https://ifst-ineppass.github.io/down/ifst1.3.apk",
    campaign: "utm_campaign",
    term: "utm_term"
};

var source_info = {
    download_url: constant.apkPath,
    jumpurl: getSearchParam().jumpurl || "",
    openApp: function () {
        trackClick({
            target_url: decodeURIComponent(source_info.jumpurl),
            download_url:source_info.download_url
        })
        // debugger
        // window.location = "dmall://dmall/app://Native?@animate=null&@jump=true&type=23&scene=offline&successUrl="+source_info.jumpurl;
        if (client.weixin) {
            window.location = 'javascript:showWxDownLoad();';
            return
        }

        if (os.ios) {

            window.location = "dmall://dmall/" +  decodeURIComponent(source_info.jumpurl);
        } else {
            // window.location = "dmall://dmall/app://home?@animate=null&@jump=true";
            window.location ="dmall://dmall/" +  decodeURIComponent(source_info.jumpurl);
        }

        setTimeout(function () {
            window.location = source_info.download_url;
        }, 1500)
    }
};

function getSearchParam(href) {
    var str, obj, path,
        result = {};

    href = href || window.location.href;
    path = href.split('?')[1] || '';
    path = path.split('#')[0];
    path = path.split('&');
    for (var i = 0; str = path[i]; ++i) {
        obj = str.split('=');
        if (obj.length !== 2) {
            continue;
        }
        result[obj[0]] = obj[1];
    }
    return result;

}

function getAppStorePath() {
    if ((campaign) && (term)) {
        return constant.appStore + '&' + constant.campaign + '=' + campaign + '&' + constant.term + '=' + term;
    } else {
        return constant.appStore;
    }
}


if (os.pc) {
    $('.piwik_download:eq(1),.download3>a:eq(1)').attr('href', getAppStorePath());
} else if (os.ios) {
    source_info.download_url = constant.appStore; //getAppStorePath();
}
if ((campaign) && (term)) {
    $.ajax({
        type: 'GET',
        url: channel_api,
        data: {
            campaign: campaign,
            term: term
        },
        dataType: 'json',
        success: function (data) {
            if (!os.ios && !client.weixin) {
                source_info.download_url = data.apk;
            }
            if (data.images && data.images.length) {
                replaceImages(data.images);
            }
        },
        error: function (xhr, type) {
            //		source_info.download_url = constant.apkPath;
        }
    });
}

function replaceImages(images) {
    var i = 0,
        l = images.length, dict = {
            pc_image: "pc_page1",
            app_image: "page1",
            pc_apple_btn: "pc_ios",
            pc_android_btn: "pc_android",
            app_apple_btn: "ios",
            app_android_btn: "android"
        }, image;
    for (; i < l; i++) {
        console.log(image);
        image = images[i];
        image.key = dict[image.image_name];
        image.src = image.image_url;
        if (!image.key || !image.src) {
            continue;
        }
        replaceImage(image);
    }
}

function replaceImage(img) {
    var key = img.key.toLowerCase(), src = img.src, isPcKey = key.indexOf("pc_") == 0,
        btn = key.indexOf("ios") > -1 ? 1 : 0;
    if (isPcKey) {
        key = key.substring(3);
        if (key.indexOf("page") == 0) {
            $("." + key).css({
                "background-image": "url(" + src + ")"
            });
        } else {
            $(".download>a:eq(" + btn + "),.download3>a:eq(" + btn + ")").find("img").attr("src", src);
        }
    } else {
        if (key.indexOf("page") == 0) {
            var cls = [".one", ".two", ".three"], i = Number(key.substring(4)) - 1;
            $(cls[i] + ">img").attr("src", src);
        } else {
            $(".download img").attr("src", src);
        }
    }
}

// 点击上报
function trackClick(attrs) {
    if (window.DmallTracker && typeof window.DmallTracker.track === "function") {
        window.DmallTracker.track("element_click", "1.0", {
            page_title: "下载引导页",
            start_time: Date.now(),
            element_id:"download_btn",
            element_name:"下载按钮",
            element_params:attrs
        });
    }
}

//设置微信浏览器覆盖层
var wx = wx || {
    bWeixin: false
};

function showWxDownLoad() {
    wx.bWeixin = !wx.bWeixin;
};
wx.showWxDownLoad = function () {
    wx.bWeixin = !wx.bWeixin;
};

if (client.weixin) {
    source_info.download_url = 'javascript:showWxDownLoad();';
}
rivets.bind(document.getElementById('tip_pop'), wx);
rivets.bind(document.getElementById('pageContain'), {
    source_info: source_info
});


if (window.DmallTracker && typeof window.DmallTracker.track === "function") {
    const jumpurl = decodeURIComponent(getSearchParam().jumpurl);
    if (jumpurl){
        const tdc = getSearchParam(jumpurl).tdc;
        if (tdc && typeof window.DmallTracker.setTrackDataCode === "function") window.DmallTracker.setTrackDataCode(tdc);
    }

    window.DmallTracker.track("page_enter", "1.0", {
        page_title: "下载引导页",
        start_time: Date.now(),
        is_return: 0
    });

    setTimeout(()=>{
        window.DmallTracker.track("page_view", "1.0", {
            page_title: "下载引导页",
            start_time: Date.now(),
            is_return: 0
        });
    },500);
}