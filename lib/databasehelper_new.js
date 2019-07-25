const mysql = require("promise-mysql");
const FileCache = require("./filecache");

class DatabaseHelper {
    constructor(config) {
        this._config = config;
        this._dbpool = null;
        this._connected = false;
        this._filecache = new FileCache();
    }

    createConnection() {
        return mysql.createPool({
            connectionLimit: this._config.get("mysql.connections", 20),
            host: this._config.get("mysql.host", "localhost"),
            user: this._config.get("mysql.user", "root"),
            password: this._config.get("mysql.password", "abc123"),
            database: this._config.get("mysql.database", "dbname"),
            port: this._config.get("mysql.port", 3306),
            debug: false,
            multipleStatements: true,
            acquireTimeout: Number.POSITIVE_INFINITY
        }).then(poolconnection => {
            this._dbpool = poolconnection;
            return this.testConnection();
        })
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
        return this.getFileData(filename).then(sql => {
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