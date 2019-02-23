const Mrhid6Utils = require("../index.js");

const configOptions = {
    configFileName: "./test_config.json"
}

const config = new Mrhid6Utils.Config(configOptions);
const DB = new Mrhid6Utils.DatabaseHelperNew(config);
const logger = new Mrhid6Utils.Logger(config, {
    basedir: __dirname + "/../"
});

DB.createConnection();


DB.testConnection().then(() => {
    console.log("connected!");
}, () => {
    console.log("not Connected!");
});
let count = 0;
for (let i = 0; i < 10000; i++) {
    DB.queryUsingSQLFile(__dirname + "/../test/players.sql").then(rows => {
        count++;
        console.log(count);
    }).catch(err => {
        console.log(err);
    })
}