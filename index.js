const Mrhid6Utils = {}

Mrhid6Utils.NET = {}
Mrhid6Utils.Config = require("./lib/config.js");
Mrhid6Utils.DatabaseHelper = require("./lib/databasehelper");
Mrhid6Utils.Cleanup = require("./lib/cleanup");
Mrhid6Utils.Logger = require("./lib/logger");

module.exports = Mrhid6Utils;