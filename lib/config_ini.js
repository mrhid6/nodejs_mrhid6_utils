const path = require('path');
const fs = require('fs-extra');
const objectpath = require("object-path");
const ini = require('ini');


class Config_Ini {
    constructor(opts) {
        const default_options = {
            saveonset: true
        }

        this._options = Object.assign({}, default_options, opts);

        this._path = path.resolve(this._options.configPath);
        this._filename = this._options.filename;
        this._filepath = path.join(this._path, this._filename)
    }

    load() {
        if (fs.pathExistsSync(this._filepath) == false) {
            this._data = {};
            this.save();
        }
        this._data = this.parseDataFile();
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
        fs.writeFileSync(this._filepath, ini.stringify(this._data));
    }

    parseDataFile() {
        try {
            return ini.parse(fs.readFileSync(this._filepath, 'utf-8'))
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Config_Ini;