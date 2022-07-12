const path = require('path');
const fs = require("fs-extra");
const Logger = require('simple-node-logger')
const platform = process.platform;

class Mh6Logger {
    constructor(opts) {
        let userDataPath = null;

        switch (platform) {
            case "win32":
                userDataPath = path.resolve("C:\\ProgramData");
                break;
            case "linux":
            case "darwin":
                userDataPath = path.resolve(require('os').homedir());
                break;
        }

        const default_options = {
            logName: "TestLog",
            logBaseDirectory: path.join(userDataPath, "logs"),
            logLevel: "debug"
        }
        this._options = Object.assign(default_options, opts);
        this._options.logDirectory = path.join(this._options.logBaseDirectory, this._options.logName)
    }

    init() {

        fs.ensureDirSync(this._options.logDirectory);

        const LoggerOpts = {
            timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS',
            logDirectory: this._options.logDirectory,
            fileNamePattern: `<DATE>-${this._options.logName}.log`,
            dateFormat: 'YYYYMMDD',
            level: this._options.logLevel
        }


        const LogManager = Logger.createLogManager(LoggerOpts);
        LogManager.createConsoleAppender(LoggerOpts);
        this._logger = LogManager.createLogger();

        this.debug(`[LOGGER] - Log Directory ${this._options.logDirectory}`)
    }

    log(msg) {
        this.info(msg)
    }

    info(msg) {
        this._logger.info(msg);
    }

    debug(msg) {
        this._logger.debug(msg);
    }

    warn(msg) {
        this._logger.warn(msg);
    }

    error(msg) {
        this._logger.error(msg);
    }
}

module.exports = Mh6Logger;