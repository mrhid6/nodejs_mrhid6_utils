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

module.exports = Mrhid6Utils;