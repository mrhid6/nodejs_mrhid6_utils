const Mrhid6Utils = require("../index.js");

const configOptions = {
    configFileName: "./test_config.json",
    defaultConfigFile: "./default_config.json"
}

const config = new Mrhid6Utils.Config(configOptions);

const DB = new Mrhid6Utils.DatabaseHelperNew(config);

DB.createConnection().then(() => {
    console.log("connected!");
    DB.query("SELECT * FROM nodes").then(rows => {
        console.log(rows[0]);
    })
}).catch(err => {
    console.log("testConnection failed!");
    console.log(err);
})