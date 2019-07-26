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
}).catch(err => {
    console.log("testConnection failed!");
    console.log(err);
})

setTimeout(() => {
    DB.testConnection().then(() => {
        console.log("Test Complete");
    }).catch(err => {
        console.log(err);
    })
}, (3.5 * 60 * 1000))