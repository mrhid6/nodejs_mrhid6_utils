const path = require('path');
const fs = require('fs-extra');
const objectpath = require("object-path");

class Config {
    constructor(opts) {
        const default_options = {
            saveonset: true
        }
        this._options = Object.assign({}, default_options, opts);
        this._path = this._options.configFileName;
    }

    load() {
        if (fs.pathExistsSync(this._path) == false) {
            if (this._options.defaultConfigFile != null) {
                fs.copyFileSync(this._options.defaultConfigFile, this._path);
            } else {
                this._data = {};
                this.save();
            }
        }
        this._data = parseDataFile(this._path);
        this.save();
    }

    get(key, defaultval) {
        let return_val = objectpath.get(this._data, key);
        if (return_val == null) {
            this.set(key, defaultval);
        }
        return objectpath.get(this._data, key);
    }

    set(key, val) {
        objectpath.set(this._data, key, val);
        if (this._options.saveonset) {
            this.save();
        }
    }

    save() {
        fs.writeFileSync(this._path, JSON.stringify(this._data, null, 4));
    }
}

function parseDataFile(filePath, defaults) {
    try {
        return JSON.parse(fs.readFileSync(filePath));
    } catch (error) {
        throw error;
    }
}

module.exports = Config;