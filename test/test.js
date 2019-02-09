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

DB.queryUsingSQLFile("players.sql").then(rows => {
    console.log(rows);
})