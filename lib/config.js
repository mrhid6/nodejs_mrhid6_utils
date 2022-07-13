const path = require('path');
const fs = require('fs-extra');
const objectpath = require("object-path");
const ini = require('ini');
const platform = process.platform;

class Config {
    constructor(opts) {

        let userDataPath = "";
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
            saveonset: true,
            createConfig: true,
            configBaseDirectory: path.join(userDataPath, "configs"),
            configName: "TestConfig",
            configType: "json"
        }
        this._options = Object.assign({}, default_options, opts);
        this._options.configDirectory = path.join(this._options.configBaseDirectory, this._options.configName);

        const configFile = `${this._options.configName}.${this._options.configType}`
        this._options.configFilePath = path.join(this._options.configDirectory, configFile)

        this._data = {};
    }

    validateBeforeLoad() {

        fs.ensureDirSync(this._options.configDirectory);

        if (fs.existsSync(this._options.configFilePath) == false && this._options.createConfig == false) {
            return false;
        }

        return true;
    }

    load = async() => {
        if (this.validateBeforeLoad() == false) {
            throw new Error("Error validating config!")
        }

        if (fs.existsSync(this._options.configFilePath) == false) {
            this._data = {};
            this.save();
        }

        try {
            this._data = this.parseDataFile();
            this.save();
        } catch (err) {
            throw err;
        }

        await this.postLoad();
    }

    postLoad = async() => {
        await this.setDefaultValues();
    }

    setDefaultValues = async() => {

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

    delete(key) {
        objectpath.del(this._data, key);
        if (this._options.saveonset) {
            this.save();
        }
    }

    save() {

        if (this._options.configType == "json") {
            this.saveJSONFile();
        } else if (this._options.configType == "ini") {
            this.saveINIFile();
        }
    }

    saveJSONFile() {
        fs.writeFileSync(this._options.configFilePath, JSON.stringify(this._data, null, 4));
    }

    saveINIFile() {
        fs.writeFileSync(this._options.configFilePath, ini.stringify(this._data));
    }

    parseDataFile() {
        if (this._options.configType == "json") {
            return this.parseJSONDataFile();
        } else if (this._options.configType == "ini") {
            return this.parseIniDataFile();
        }
    }

    parseJSONDataFile() {
        try {
            return JSON.parse(fs.readFileSync(this._options.configFilePath));
        } catch (error) {
            throw error;
        }
    }

    parseIniDataFile() {
        try {
            return ini.parse(fs.readFileSync(this._options.configFilePath, 'utf-8'))
        } catch (error) {
            throw error;
        }
    }

    getConfigData() {
        return this._data;
    }
}

module.exports = Config;