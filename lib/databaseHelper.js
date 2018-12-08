var mysql = require("mysql");


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

    testConnection(callback) {
        this._FORCE = true;
        this.query("SHOW TABLES", (err, rows) => {
            if (err) {
                callback(false);
            } else {
                callback(true);
            }
            this._FORCE = false;
        })
    }

    setConnected(connected) {
        this._connected = connected;
    }

    isConnected() {
        return this._connected;
    }

    query(var1, var2, var3) {
        var query_lenth = arguments.length;
        if (this.isConnected() == false && this._FORCE != true) {
            var callback = null;

            if (query_lenth == 2) {
                callback = var2;
            } else {
                callback = var3;
            }

            callback(null);
            return;
        };

        this._dbpool.getConnection(function (err, connection) {
            if (err) {

                if (typeof connection !== "undefined")
                    connection.release();
                var callback = null;

                if (query_lenth == 2) {
                    callback = var2;
                } else {
                    callback = var3;
                }

                callback(err);
                return;
            }

            if (query_lenth == 2) {

                var query = var1;
                var callback = var2;

                connection.query(query, function (err, rows) {

                    if (err) {
                        callback(err, rows);
                    } else {
                        callback(err, rows);
                    }
                    connection.release();
                });
            } else if (query_lenth == 3) {

                var query = var1;
                var data = var2;
                var callback = var3;

                connection.query(query, data, function (err, rows) {
                    if (err) {
                        callback(err, rows);
                    } else {
                        callback(err, rows);
                    }
                    connection.release();
                });
            }
        });
    };

    queryUsingSQLFile(filename, var1, var2) {
        var query_lenth = arguments.length;

        loadSQLFileToString(filename, (SQLStr) => {
            if (query_lenth == 2) {
                this.query(SQLStr, var1);
            } else if (query_lenth == 3) {
                this.query(SQLStr, var1, var2);
            }
        })
    };
}

function loadSQLFileToString(filename, callback) {
    var fs = require('fs');
    var readline = require('readline');

    var rl = readline.createInterface({
        input: fs.createReadStream(filename),
        terminal: false
    });
    var SQLStr = "";
    rl.on('line', function (chunk) {
        SQLStr += chunk.toString('ascii') + " ";
    });
    rl.on('close', function () {
        callback(SQLStr);
    });
}

module.exports = DatabaseHelper;