const Mrhid6Utils = {}

Mrhid6Utils.NET = {}
Mrhid6Utils.Config = require("./lib/config.js");
Mrhid6Utils.FileCache = require("./lib/filecache.js");
Mrhid6Utils.DatabaseHelper = require("./lib/databasehelper");
Mrhid6Utils.DatabaseHelperNew = require("./lib/databasehelper_new");
Mrhid6Utils.Cleanup = require("./lib/cleanup");
Mrhid6Utils.Logger = require("./lib/logger");


Mrhid6Utils.NetworkServer = require("./lib/networkserver");
Mrhid6Utils.NetworkClient = require("./lib/networkclient");

Mrhid6Utils.Tools = {};
Mrhid6Utils.Tools.generateRandomString = function (length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

Mrhid6Utils.Tools.generateRandomInt = function (length) {
    var text = "";
    var possible = "0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

Mrhid6Utils.Tools.generateUUID = function (format) {
    var formatdata = format.split("-");

    var ret_str = "";

    for (var i = 0; i < formatdata.length; i++) {
        var d = formatdata[i];
        if (i > 0) {
            ret_str = ret_str + "-" + Mrhid6Utils.Tools.generateRandomString(d.length);
        } else {
            ret_str = ret_str + Mrhid6Utils.Tools.generateRandomString(d.length);
        }
    }

    formatdata = undefined;
    return ret_str;
}

Mrhid6Utils.Tools.openModal = function (modal_name, var1, var2) {

    let options = {
        allowBackdropRemoval: true
    };

    let callback = null;

    if (arguments.length == 2) {
        callback = var1;
    } else if (arguments.length == 3) {
        options = var1;
        callback = var2;
    }

    if ($("body").hasClass("modal-open")) {
        return;
    }

    $.ajax({
        url: "/public/modals/" + modal_name + ".html",
        success: function (data) {

            $('body').append(data);

            var modalEl = $("#" + modal_name);

            modalEl.find("button.close").click(function (e) {
                e.preventDefault();
                modalEl.trigger("hidden.bs.modal");
                $("body").removeClass("modal-open").attr("style", null);
            })

            modalEl.on('hidden.bs.modal', function () {
                $(this).remove();
                $('[name^="__privateStripe"]').remove();
                SS_WEB.Dashboard.modal_opened = false;
                if (options.allowBackdropRemoval == true)
                    $('.modal-backdrop').remove();
            });
            modalEl.modal('show');
            if (callback)
                callback(modalEl);
        },
        dataType: 'html'
    });
};

module.exports = Mrhid6Utils;