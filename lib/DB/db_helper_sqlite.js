const Database = require('better-sqlite3');
const path = require("path");
const fs = require("fs-extra");

const iDBHelper = require("./databasehelper").default;

class DBHelperSQLite extends iDBHelper {
    constructor(config) {
        super(config);

        this._config.get("db.sqlite.dir", __dirname);
        this._config.get("db.sqlite.filename", "db.db");
        this._config.get("db.sqlite.filepath", path.join(this._config.get("db.sqlite.dir"), this._config.get("db.sqlite.filename")));

    }


    createConnection() {
        return new Promise((resolve, reject) => {

            fs.ensureDirSync(this._config.get("db.sqlite.dir"))

            try {
                this.DB = new Database(this._config.get("db.sqlite.filepath"), {
                    //verbose: console.log,
                    fileMustExist: false
                });

            } catch (err) {
                reject(err);
                return;
            }

            this.testConnection().then(connected => {
                resolve(connected);
            }).catch(err => {
                reject(err);
            })

        })
    }

    testConnection() {
        return new Promise((resolve, reject) => {

            const sql = `SELECT name FROM sqlite_master WHERE type='table'`;
            this.query(sql).then(rows => {
                resolve(rows.length > 0);
            }).catch(err => {
                console.log(err);
                resolve(false);
            });
        })
    }

    queryNormal(sql, data = []) {
        return new Promise((resolve, reject) => {
            const stmt = this.DB.prepare(sql)
            try {
                const rows = stmt.all(data);
                resolve(rows);
            } catch (err) {
                reject(err);
            }
        })
    }

    querySingle(sql, data = []) {
        return new Promise((resolve, reject) => {
            const stmt = this.DB.prepare(sql)
            try {
                const row = stmt.get(data);
                resolve(row);
            } catch (err) {
                reject(err);
            }
        })
    }

    queryRun(sql, data = []) {
        return new Promise((resolve, reject) => {
            const stmt = this.DB.prepare(sql)
            try {
                stmt.run(data);
                resolve();
            } catch (err) {
                reject(err);
            }
        })
    }

    queryExec(sql) {
        return new Promise((resolve, reject) => {
            try {
                this.DB.exec(sql);
                resolve();
            } catch (err) {
                reject(err);
            }
        })
    }
}

module.exports = DBHelperSQLite;