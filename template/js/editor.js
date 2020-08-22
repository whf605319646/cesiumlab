$(document).ready(function () {
    initPage();
    bindEvents();
    sidebarScrollFix();
});

var aceEditor;
var containExamples = true;

function initPage() {
    initSideBar();
    initEditor();
    screenResize();
}

function initSideBar() {
    var config = exampleConfig;
    var sideBar = $("ul#sidebar-menu");
    for (var key in config) {
        sideBar.append(createSideBarMenuItem(key, config[key], containExamples));
    }
    $(sideBar).ready(function () {
        initSelect();
    });

}

function screenResize() {
    window.onresize = function () {
        mapHeight();
    };
}

//初始化编辑器
function initCodeEditor() {
    if (!aceEditor) {
        aceEditor = ace.edit("editor");
        aceEditor.setTheme("ace/theme/textmate");
        aceEditor.getSession().setMode("ace/mode/html");
        aceEditor.getSession().setUseWrapMode(true);
        aceEditor.setShowPrintMargin(false);
        aceEditor.$blockScrolling = Infinity;
    }
    aceEditor.setValue($('#editor').val());
    aceEditor.clearSelection();
    aceEditor.moveCursorTo(0, 0);
}

//初始化编辑器以及预览内容
function initEditor() {
    loadExampleHtml();
    initCodeEditor();
}

function loadExampleHtml() {
    var locationParam = getLocationParam();
    if (!locationParam) {
        return;
    }
    var href = window.location.toString();
    var mapUrl = href.substr(0, href.lastIndexOf('/') + 1);
    mapUrl = mapUrl +locationParam + ".html";
    if (!mapUrl) {
        return;
    }
    var html = $.ajax({
        url: mapUrl,
        async: false,
        error: function (error) {
            alert("请在服务器环境下运行示范程序！");
            html = "";
        }
    }).responseText;
    if (html && html != "") {
        $('#editor').val(html);
        loadPreview(html);
    }
}

function getLocationParam() {
    var param = window.location.toString();
    if (param.indexOf("#") === -1) {
        return null;
    }
    param = param.split("#");
    if (param && param.length > 0) {
        return param[1];
    }
}

//运行代码
function run() {
    var iframeContent = $("#editor").val();
    if (editor) {
        iframeContent = aceEditor.getValue();
    }
    loadPreview(iframeContent);
}

//填充预览效果内容
function loadPreview(content) {
    var iFrame = createIFrame(),
        iframeDocument = iFrame.contentWindow.document;

    iframeDocument.open();
    iframeDocument.write(content);
    iframeDocument.close();
    iframeDocument.addEventListener('load', function () {
        mapHeight();
    });
    mapHeight();
}

function createIFrame() {
    var preViewPane = $("#previewPane");
    preViewPane.empty();
    var iframe = document.createElement("iframe");
    $(iframe).attr("id", "innerPage");
    $(iframe).attr("name", "innerPage");
    preViewPane.append(iframe);
    return iframe;
}

//重置编辑器
function refresh() {
    initEditor();
    run();
}

function initSelect() {
    var hash = window.location.hash;
    var id;
    if (hash.indexOf("#") === -1) {
        id = $("section#sidebar .thirdMenu a.link").first().attr('id');
        window.location.hash = (id) ? "#" + id : window.location.hash;
    } else {
        id = hash.split("#")[1];
    }
    selectMenu(id);
}

function mapHeight() {
    var doc = $("#innerPage").contents();
    doc.find("html").height("100%");
    doc.find("body").height("100%");
}

function bindEvents() {
    $("#sidebar ul.third-menu a").click(function (evt) {
        var target = $(evt.target).parent().parent();
        var nodeId = evt.target.id;
        //如果点击的是span节点还要往上一层
        if (evt.target.localName === "span") {
            nodeId = target.attr('id');
        }

        if (nodeId) {
            //阻止冒泡防止上层事件响应导致修改url hash值
            evt.preventDefault();
            window.location.hash = "#" + nodeId;
            initEditor();
            evt.stopPropagation();
        }
    });
    var codePane = $("#codePane");
    var previewPane = $("#previewPane");
    var expand = !!1;
    $("#showCodeBtn").click(function () {
        if (expand) {
            //编辑器和预览宽度5:7
            $(this).text(" 展开");
            // fix 展开/源码按钮遮挡其它控件样式
            $(this).css("left", "42%");
            $(this).addClass("fa-arrows-alt");
            $(this).removeClass(" fa-compress");
            codePane.show(10, function () {
                previewPane.removeClass("col-md-12");
                previewPane.addClass("col-md-7");
                codePane.addClass("col-md-5");
            });
        } else {
            //预览独占一行
            $(this).text(" 源码");
            $(this).css("left", 0);
            $(this).addClass(" fa-compress");
            $(this).removeClass("fa-arrows-alt");
            codePane.hide(200, function () {
                codePane.removeClass("col-md-5");
                previewPane.removeClass("col-md-7");
                previewPane.addClass("col-md-12");
            });
        }
        expand = !expand;
    });

    window.addEventListener("hashchange", function () {
        var hash = window.location.hash;
        if (hash.indexOf("#") !== -1) {
            var id = hash.split("#")[1];
            selectMenu(id);
        }
    });
}