const mysql = require("mysql2/promise");
const path = require("path");

require('events').defaultMaxListeners = 100;

const iDBHelper = require("./databasehelper").default;

class DBHelperMysql extends iDBHelper {
    constructor(config) {
        super(config);
        this._dbpool = null;
    }

    createConnection() {

        const existingConfig = this._config.get("mysql");

        if (existingConfig != null) {
            this._config.set("db.mysql", existingConfig);
            this.setScriptsDirectory(existingConfig.basedir);
            this._config.delete("db.mysql.basedir");
            this._config.delete("mysql");
        }


        this._dbpool = mysql.createPool({
            connectionLimit: this._config.get("db.mysql.connections", 20),
            host: this._config.get("db.mysql.host", "localhost"),
            user: this._config.get("db.mysql.user", "root"),
            password: this._config.get("db.mysql.password", "abc123"),
            database: this._config.get("db.mysql.database", "dbname"),
            port: this._config.get("db.mysql.port", 3306),
            debug: false,
            multipleStatements: true,
            waitForConnections: true
        });
        return this.testConnection();
    }

    testConnection() {
        return new Promise((resolve, reject) => {
            this.query("SHOW TABLES").then(rows => {
                resolve(true);
            }).catch(err => {
                console.log(err);
                resolve(false);
            })
        })
    }

    query(sql, args = [], QueryType = 0) {
        return this.queryNormal(sql, args);
    }

    queryNormal(sql, args) {
        return new Promise((resolve, reject) => {
            this._dbpool.getConnection().then((connection) => {
                connection.query(sql, args).then(rows => {
                    connection.release();
                    resolve(rows[0]);
                }).catch(err => {
                    reject(err);
                })
            }).catch(err => {
                reject(err);
            })
        });
    }
}

module.exports = DBHelperMysql;