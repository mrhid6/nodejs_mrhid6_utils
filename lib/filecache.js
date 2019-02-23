const toAbsolute = require("path").resolve;
const fs = require("fs");

class FileCache {

    constructor() {
        this._cache = new Map();
    }

    readFile(path) {
        return new Promise((resolve, reject) => {
            const absPath = toAbsolute(path);

            if (this._cache.has(absPath)) {
                resolve(this._cache.get(absPath));
                return;
            } else {
                try {
                    const data = fs.readFileSync(absPath, "utf8")
                    this._cache.set(absPath, data);
                    resolve(data);
                } catch (err) {
                    reject(error)
                }
            }
        });
    }

    updateCache(path) {
        return new Promise((resolve, reject) => {
            const absPath = toAbsolute(path);
            try {
                const data = fs.readFileSync(absPath, "utf8")
                this._cache.set(absPath, data);
                resolve(data);
            } catch (err) {
                reject(error)
            }
        });
    }
}

module.exports = FileCache;