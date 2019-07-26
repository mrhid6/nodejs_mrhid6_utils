const Mrhid6Utils = require("../index.js");

const configOptions = {
    configFileName: "./test_config.json",
    defaultConfigFile: "./default_config.json"
}

const config = new Mrhid6Utils.Config(configOptions);

const DB = new Mrhid6Utils.DatabaseHelperNew(config);

DB.createConnection()

DB.testConnection().then(() => {
    console.log("connected!");

    for (var i = 0; i < 400; i++) {
        DB.query("SHOW TABLES").then(() => {
            console.log("1");
        })
    }

}).catch(err => {
    console.log("testConnection failed!");
    console.log(err);
})