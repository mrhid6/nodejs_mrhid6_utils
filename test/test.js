const Mrhid6Utils = require("../index.js");

const configOptions = {
    configFileName: "./test_config.json"
}

const config = new Mrhid6Utils.Config(configOptions);
const DB = new Mrhid6Utils.DatabaseHelper(config);
const logger = new Mrhid6Utils.Logger(config, {
    basedir: __dirname + "/../"
});

DB.createConnection();
DB.testConnection((connected) => {
    DB.setConnected(connected);
    console.log(connected);
});

logger.welcome();