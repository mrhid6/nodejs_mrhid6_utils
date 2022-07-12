const Mrhid6Utils = require("../index.js");

const Logger = Mrhid6Utils.Logger;


class MainLogger extends Logger {
    constructor() {
        super({
            logName: "Testing"
        })
    }
}

const theLogger = new MainLogger();

theLogger.init();