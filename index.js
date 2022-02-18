const Mrhid6Utils = {}

Mrhid6Utils.NET = {}
Mrhid6Utils.Config = require("./lib/config.js");
Mrhid6Utils.FileCache = require("./lib/filecache.js");
Mrhid6Utils.DB = {
    QueryTypes: require("./lib/DB/databasehelper").QueryTypes,
    MySQL: require("./lib/DB/db_helper_mysql"),
    SQLite: require("./lib/DB/db_helper_sqlite")
}
Mrhid6Utils.DatabaseHelper = require("./lib/DB/db_helper_mysql");
Mrhid6Utils.Cleanup = require("./lib/cleanup");
Mrhid6Utils.Logger = require("./lib/logger");
Mrhid6Utils.RedisHelper = require("./lib/redishelper");
Mrhid6Utils.Metrics = require("./lib/metrics");
Mrhid6Utils.MySQLModel = require("./lib/mysqlmodel").Model;
Mrhid6Utils.MySQLModelTypes = require("./lib/mysqlmodel").TYPES;
Mrhid6Utils.NetworkServer = require("./lib/networkserver");
Mrhid6Utils.NetworkClient = require("./lib/networkclient");

Mrhid6Utils.WSNetworkServer = require("./lib/WSNetworkServer");

Mrhid6Utils.Tools = require("./lib/tools");

module.exports = Mrhid6Utils;