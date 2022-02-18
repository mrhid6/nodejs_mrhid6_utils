const mysql = require("mysql2/promise");
const path = require("path");
const FileCache = require("../filecache");

require('events').defaultMaxListeners = 100;

const QueryTypes = {
    NORMAL: 0,
    SINGLE: 1,
    RUN: 2,
    EXEC: 3
}

class DatabaseHelper {
    constructor(config) {
        this._config = config;
        this._connected = false;
        this._filecache = new FileCache();
    }

    init() {
        return new Promise((resolve, reject) => {
            this.createConnection().then((connected) => {
                this._connected = connected;
                resolve();
            }).catch(err => {
                this._connected = false;
                reject(err);
            })
        })
    }

    setScriptsDirectory(directory) {
        this._config.set("db.scriptsdir", directory)
    }

    createConnection() {}

    testConnection() {}

    query(sql, args) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    querySingle(sql, args) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    queryRun(sql, args) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    queryExec(sql, args) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }



    queryUsingSQLFile(filename, args, QueryType = 0) {
        return new Promise((resolve, reject) => {
            const clean_filename = filename.replace(this._config.get("db.scriptsdir"), "");
            const file = path.join(this._config.get("db.scriptsdir"), clean_filename);

            this.getFileData(file).then(sql => {
                if (QueryType == QueryTypes.NORMAL)
                    return this.query(sql, args);

                if (QueryType == QueryTypes.SINGLE)
                    return this.querySingle(sql, args);

                if (QueryType == QueryTypes.RUN)
                    return this.queryRun(sql, args);

                if (QueryType == QueryTypes.EXEC)
                    return this.queryExec(sql, args);


            }).then(rows => {
                resolve(rows);
            }).catch(reject);
        });
    }

    getFileData(path) {
        return this._filecache.readFile(path);
    }

    buildSqlData(SQL, data = []) {
        let NewSQL = SQL;
        for (let i = 0; i < data.length; i++) {
            const d = data[i];
            NewSQL = NewSQL.replace("?", d)
        }

        return NewSQL;
    }
}

module.exports.default = DatabaseHelper;
module.exports.QueryTypes = QueryTypes;