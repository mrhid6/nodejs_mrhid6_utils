const path = require("path");
const fs = require("fs-extra");
const platform = process.platform;

const winston = require("winston");

class Mh6Logger {
    constructor() {}

    init(opts) {
        let userDataPath = null;

        switch (platform) {
            case "win32":
                userDataPath = path.resolve("C:\\ProgramData");
                break;
            case "linux":
            case "darwin":
                userDataPath = path.resolve(require("os").homedir());
                break;
        }

        const default_options = {
            logName: "TestLog",
            logBaseDirectory: path.join(userDataPath, "logs"),
            logLevel: "debug",
        };
        this._options = Object.assign(default_options, opts);
        this._options.logDirectory = path.join(
            this._options.logBaseDirectory,
            this._options.logName
        );

        fs.ensureDirSync(this._options.logDirectory);

        const logger = winston.createLogger({
            level: "debug",
            format: winston.format.simple(),
            transports: [
                //
                // - Write all logs with importance level of `error` or less to `error.log`
                // - Write all logs with importance level of `info` or less to `combined.log`
                //
                new winston.transports.File({
                    dirname: this._options.logDirectory,
                    filename: this._options.logName + "-error.log",
                    level: "error",
                }),
                new winston.transports.File({
                    dirname: this._options.logDirectory,
                    filename: this._options.logName + "-combined.log",
                }),
            ],
        });

        logger.add(
            new winston.transports.Console({
                format: winston.format.simple(),
            })
        );

        this._logger = logger;

        this.debug(`[LOGGER] - Log Directory ${this._options.logDirectory}`);
    }

    log(msg) {
        this.info(msg);
    }

    info(msg) {
        this._logger.log({ level: "info", message: msg });
    }

    debug(msg) {
        this._logger.log({ level: "debug", message: msg });
    }

    warn(msg) {
        this._logger.log({ level: "warn", message: msg });
    }

    error(msg) {
        this._logger.log({ level: "error", message: msg });
    }
}

module.exports = Mh6Logger;
