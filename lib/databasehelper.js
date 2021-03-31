const mysql = require("mysql2/promise");
const path = require("path");
const FileCache = require("./filecache");

require('events').defaultMaxListeners = 100;

class DatabaseHelper {
    constructor(config) {
        this._config = config;
        this._dbpool = null;
        this._connected = false;
        this._filecache = new FileCache();
    }

    setBaseDirectory(directory) {
        this._config.set("mysql.basedir", directory)
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
            waitForConnections: true
        });
        return this.testConnection();
    }

    testConnection() {
        return new Promise((resolve, reject) => {
            this.query("SHOW TABLES").then(rows => {
                resolve();
            }).catch(err => {
                reject(err);
            })
        })
    }

    query(sql, args) {
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

    queryUsingSQLFile(filename, args) {

        const clean_filename = filename.replace(this._config.get("mysql.basedir"), "");
        const file = path.join(this._config.get("mysql.basedir"), clean_filename);

        return this.getFileData(file).then(sql => {
            return this.query(sql, args);
        }).catch((err) => {
            console.log(err);
        });
    }

    getFileData(path) {
        return this._filecache.readFile(path);
    }
}

module.exports = DatabaseHelper;