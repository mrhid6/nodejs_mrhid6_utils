const objectpath = require("object-path");
const platform = process.platform;

class VariableCache {
    constructor() {
        this._data = {};
    }

    init() {
        if (platform == "win32") {
            this.setupWindowsVarCache();
        } else if (platform == "linux") {
            this.setupLinuxVarCache();
        }
    }

    setupWindowsVarCache() {}
    setupLinuxVarCache() {}



    get(key, defaultval) {
        let return_val = objectpath.get(this._data, key);
        if (return_val == null && defaultval != null) {
            this.set(key, defaultval);
        }
        return objectpath.get(this._data, key);
    }

    set(key, val) {
        objectpath.set(this._data, key, val);
    }

    push(key, val) {
        objectpath.push(this._data, key, val)
    }

    delete(key) {
        objectpath.del(this._data, key);
    }
}

module.exports = VariableCache;
