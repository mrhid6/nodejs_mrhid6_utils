var mysql = require("mysql");

var DB = {};
DB.FORCE = false;
DB.connected = false;

DB.createPool = function (config) {
    DB.pool = mysql.createPool({
        connectionLimit: config.get("mysql.connections"),
        host: config.get("mysql.host"),
        user: config.get("mysql.user"),
        password: config.get("mysql.password"),
        database: config.get("mysql.database"),
        port: config.get("mysql.port"),
        debug: false,
        multipleStatements: true,
        acquireTimeout: Number.POSITIVE_INFINITY
    });
};

DB.endPool = function () {
    DB.pool.end();
}

DB.createPool();

DB.testConnection = function (callback) {
    DB.FORCE = true;
    DB.query("SHOW TABLES", function (err, rows) {
        if (err) {
            callback(false);
        } else {
            callback(true);
        }
        DB.FORCE = false;
    })
};

DB.isConnected = function () {
    return DB.connected;
}

DB.setConnected = function (connected) {
    DB.connected = connected;
}

DB.useSQLFile = function (sqlfile, callback) {
    var fs = require('fs');
    var readline = require('readline');

    var path = require("path").join(__dirname, "/sqlfiles/" + sqlfile + ".sql");

    var rl = readline.createInterface({
        input: fs.createReadStream(path),
        terminal: false
    });
    var SQLStr = "";
    rl.on('line', function (chunk) {

        SQLStr += chunk.toString('ascii');

        /*myCon.query(chunk.toString('ascii'), function(err, sets, fields){
            if(err) console.log(err);
        });*/
    });
    rl.on('close', function () {
        DB.query(SQLStr, function (err, res) {
            if (err) {
                callback(false);
            } else {
                callback(true);
            }
        });
    });
};

DB.query = function (var1, var2, var3) {
    var query_lenth = arguments.length;
    if (DB.isConnected() == false && DB.FORCE != true) {
        var callback = null;

        if (query_lenth == 2) {
            callback = var2;
        } else {
            callback = var3;
        }

        callback(null);
        return;
    };

    DB.pool.getConnection(function (err, connection) {
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

DB.queryUsingSQLFile = function (filename, var1, var2) {
    var query_lenth = arguments.length;

    loadSQLFileToString(filename, function (SQLStr) {
        if (query_lenth == 2) {
            DB.query(SQLStr, var1);
        } else if (query_lenth == 3) {
            DB.query(SQLStr, var1, var2);
        }
    })
};

/**
 * @function loadSQLFileToString
 * @param {String} filename
 * @param {function(String)} callback
 */
function loadSQLFileToString(filename, callback) {
    var fs = require('fs');
    var readline = require('readline');

    var path = require("path").join(__basedir, "/sql/" + filename);

    var rl = readline.createInterface({
        input: fs.createReadStream(path),
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

module.exports = DB;
