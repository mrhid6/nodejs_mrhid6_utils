const mysql = require("promise-mysql");
const fs = require("fs");

class DatabaseHelper {
    constructor(config) {
        this._config = config;
        this._dbpool = null;
        this._FORCE = false;
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

    query(sql, args) {
        return this._dbpool.getConnection().then((connection) => {
            return connection.query(sql, args);
        }).catch((err) => {
            throw err;
        });
    }

    queryUsingSQLFile(filename, args) {
        return this.getFileData(filename, 'utf8').then(sql => {
            return this.query(sql, args);
        })
    }

    getFileData(fileName, type) {
        return new Promise(function (resolve, reject) {
            fs.readFile(fileName, type, (err, data) => {
                err ? reject(err) : resolve(data);
            });
        });
    }
}

module.exports = DatabaseHelper;