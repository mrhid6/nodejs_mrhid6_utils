const mysql = require("promise-mysql");
const fs = require("fs");

class DatabaseHelper {
    constructor(config) {
        this._config = config;
        this._dbpool = null;
        this._cachedSQLFileData = {};
        this._connected = false;
    }

    createConnection() {
        this._dbpool = mysql.createPool({
            connectionLimit: this._config.get("mysql.connections", 20),
            host: this._config.get("mysql.host", "localhost"),
            user: this._config.get("mysql.user", "root"),
            password: this._config.get("mysql.password", "abc123"),
            database: this._config.get("mysql.database", "dbname"),
            port: this._config.get("mysql.port", 3306),
            debug: false,
            multipleStatements: true,
            acquireTimeout: Number.POSITIVE_INFINITY
        });
    }

    testConnection() {
        return new Promise((resolve, reject) => {
            this.query("SHOW TABLES").then(rows => {
                resolve();
            }).catch(err => {
                reject();
            })
        })
    }

    query(sql, args) {
        return this._dbpool.getConnection().then((connection) => {
            return connection.query(sql, args).finally(() => {
                this._dbpool.releaseConnection(connection);
            });
        })
    }

    queryUsingSQLFile(filename, args) {
        return this.getFileData(filename, 'utf8').then(sql => {
            return this.query(sql, args);
        })
    }

    getFileData(fileName, type) {
        return new Promise((resolve, reject) => {
            const fileData = this._cachedSQLFileData[fileName];

            if (fileData !== undefined) {
                resolve(fileData);
            } else {
                fs.readFile(fileName, type, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        this._cachedSQLFileData[fileName] = data;
                        resolve(data);
                    }
                });
            }
        });
    }
}

module.exports = DatabaseHelper;