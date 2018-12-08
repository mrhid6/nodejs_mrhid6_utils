const Mrhid6Utils = require("./index.js");

const configOptions = {
    configFileName: "config_test"
}

const config = new Mrhid6Utils.Config(configOptions);

const DB = new Mrhid6Utils.DatabaseHelper(config);

DB.createConnection();
DB.testConnection((connected) => {
    DB.setConnected(connected);
    console.log(connected);
});