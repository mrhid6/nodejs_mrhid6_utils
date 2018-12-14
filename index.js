const Mrhid6Utils = {}

Mrhid6Utils.NET = {}
Mrhid6Utils.Config = require(__dirname+"/lib/config.js");
Mrhid6Utils.DatabaseHelper = require(__dirname+"/lib/databasehelper");
Mrhid6Utils.Cleanup = require(__dirname+"/lib/cleanup");
Mrhid6Utils.Logger = require(__dirname+"/lib/logger");


Mrhid6Utils.NetworkServer = require(__dirname+"/lib/networkserver");

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