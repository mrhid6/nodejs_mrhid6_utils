const Mrhid6Utils = require("../index.js");

const configOptions = {
    configFileName: "./test_config.json",
    defaultConfigFile: "./default_config.json"
}




for (let i = 0; i < 1; i++) {
    const config = new Mrhid6Utils.Config(configOptions);
    if (config._data.mysql.host == "TEST") {
        console.log(i);
        break;
    }
}