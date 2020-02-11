const path = require('path');
const fs = require('fs-extra');
const objectpath = require("object-path");
const ini = require('ini');

class Config {
    constructor(opts) {
        const default_options = {
            saveonset: true,
            createConfig: true
        }
        this._options = Object.assign({}, default_options, opts);

        this._path = path.resolve(this._options.configPath);
        this._filename = this._options.filename;
        this._filepath = path.join(this._path, this._filename)

        this._fileext = path.extname(this._filepath);
    }

    validateBeforeLoad() {
        if (fs.pathExistsSync(this._path) == false) {
            return false;
        }

        if (fs.existsSync(this._filepath) == false && this._options.createConfig == false) {
            return false;
        }

        return true;
    }

    load() {

        if (this.validateBeforeLoad() == false) {
            return;
        }


        if (fs.pathExistsSync(this._filepath) == false) {
            this._data = {};
            this.save();
        }
        this._data = this.parseDataFile();
        this.save();
    }

    get(key, defaultval) {
        let return_val = objectpath.get(this._data, key);
        if (return_val == null && defaultval != null) {
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

    push(key, val) {
        objectpath.push(this._data, key, val)
        if (this._options.saveonset) {
            this.save();
        }
    }

    save() {

        if (this.validateBeforeLoad() == false) {
            return;
        }

        if (this._fileext == ".json") {
            this.saveJSONFile();
        } else if (this._fileext == ".ini") {
            this.saveINIFile();
        }
    }

    saveJSONFile() {
        fs.writeFileSync(this._filepath, JSON.stringify(this._data, null, 4));
    }

    saveINIFile() {
        fs.writeFileSync(this._filepath, ini.stringify(this._data));
    }

    parseDataFile() {
        if (this._fileext == ".json") {
            return this.parseJSONDataFile();
        } else if (this._fileext == ".ini") {
            return this.parseIniDataFile();
        }
    }

    parseJSONDataFile() {
        try {
            return JSON.parse(fs.readFileSync(this._filepath));
        } catch (error) {
            throw error;
        }
    }

    parseIniDataFile() {
        try {
            return ini.parse(fs.readFileSync(this._filepath, 'utf-8'))
        } catch (error) {
            throw error;
        }
    }

    getConfigData() {
        return this._data;
    }
}

module.exports = Config;