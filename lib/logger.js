const Logger = require("nicelogger");

class Mh6Logger {
    constructor(config, opts) {
        Logger.config(config.get("logger", {}), opts.basedir);
    }

    welcome(args) {
        Logger.welcome(args)
    }

    debug(msg) {
        Logger.debug(msg);
    }

    info(msg) {
        Logger.info(msg);
    }

    warning(msg) {
        Logger.warning(msg);
    }

    error(msg) {
        Logger.error(msg);
    }

    log(msg) {
        Logger.log(msg);
    }

    box(args) {
        Logger.box(args)
    }
}

module.exports = Mh6Logger;