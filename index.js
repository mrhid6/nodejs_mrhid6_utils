const Mrhid6Utils = {}

Mrhid6Utils.NET = {}
Mrhid6Utils.Config = require("./lib/config.js");
Mrhid6Utils.Config_Ini = require("./lib/config_ini.js");
Mrhid6Utils.FileCache = require("./lib/filecache.js");
Mrhid6Utils.DatabaseHelper = require("./lib/databasehelper");
Mrhid6Utils.DatabaseHelperNew = require("./lib/databasehelper_new");
Mrhid6Utils.Cleanup = require("./lib/cleanup");
Mrhid6Utils.Logger = require("./lib/logger");
Mrhid6Utils.RedisHelper = require("./lib/redishelper");

Mrhid6Utils.NetworkServer = require("./lib/networkserver");
Mrhid6Utils.NetworkClient = require("./lib/networkclient");

Mrhid6Utils.Tools = require("./lib/tools");

module.exports = Mrhid6Utils;