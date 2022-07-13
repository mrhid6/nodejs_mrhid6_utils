const Mrhid6Utils = require("../index.js");

const iConfig = Mrhid6Utils.Config;


class Config extends iConfig {
    constructor() {
        super({
            configName: "Testing"
        })
    }

    setDefaultValues = async() => {
        this.set("test", "test1")
    }
}

const config = new Config();

config.load().then(() => {
    console.log(config)
}).catch(err => {
    console.log(err);
})