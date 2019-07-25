const Mrhid6Utils = require("../index.js");

const configOptions = {
    configFileName: "./test_config.json",
    defaultConfigFile: "./default_config.json"
}

const config = new Mrhid6Utils.Config(configOptions);

const DB = new Mrhid6Utils.DatabaseHelperNew(config);

DB.createConnection().then(() => {
    console.log("connected!");
    for (var i = 0; i < 50; i++) {
        DB.query("SHOW TABLES").then(rows => {
            console.log("##########");
        })
    }
}).catch(err => {
    console.log(err);
    console.log("failed!");
})