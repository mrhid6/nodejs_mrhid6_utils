const objectpath = require("object-path");
const {
    DB
} = require("..");


const TYPES = {
    STRING: 1,
    NUMBER: 2,
    BOOLEAN: 3,
    DATE: 4,
    TIMESTAMP: 5
};

class MySQLModel {
    constructor(DB, options) {
        this._DB = DB;
        this._options = options;
        this._data = {};
    }

    ParseData(data) {
        if (Array.isArray(data) == true && data.length > 1) {
            let index = 0;
            this._data = [];
            data.forEach(d => {
                this._ProcessData(data, index);
                index++;
            })
        } else {
            if (Array.isArray(data) == true) {
                this._ProcessData(data[0]);
            } else {
                this._ProcessData(data);
            }
        }
    }

    _ProcessData(data, index = -1) {
        this._options.translations.forEach(translation => {


            const DBColumnName = translation[0];
            const TranslationName = translation[1];
            const TranslationType = translation[2];
            const indexStr = (index > -1 ? `${index}.` : "");


            const DataValue = index > -1 ? data[index][DBColumnName] : data[DBColumnName];

            if (DataValue == null) {
                this.set(`${indexStr}${TranslationName}`, null);
                return;
            }

            if (TranslationType == null) {
                this.set(`${indexStr}${TranslationName}`, DataValue);
            } else {
                if (TranslationType == TYPES.BOOLEAN) {
                    this.set(`${indexStr}${TranslationName}`, (DataValue == 1));
                }

                if (TranslationType == TYPES.DATE) {
                    this.set(`${indexStr}${TranslationName}`, new Date(DataValue));
                }

                if (TranslationType == TYPES.TIMESTAMP) {
                    this.set(`${indexStr}${TranslationName}`, new Date(parseInt(DataValue)));
                }

                if (TranslationType == TYPES.NUMBER) {
                    if (isNaN(DataValue) == false) {
                        this.set(`${indexStr}${TranslationName}`, parseInt(DataValue));
                    }
                }

                if (TranslationType == TYPES.STRING) {
                    this.set(`${indexStr}${TranslationName}`, `${DataValue}`);
                }
            }
        })
    }

    get(key) {
        return objectpath.get(this._data, key);
    }

    set(key, val) {
        objectpath.set(this._data, key, val);
    }

    retrieve(DBColumns, DefaultDatas) {
        return new Promise((resolve, reject) => {
            let search = "";
            for (let i = 0; i < DBColumns.length; i++) {
                const DBColumn = DBColumns[i];
                const translation = this._options.translations.find(t => t[0] == DBColumn)

                if (translation == null) {
                    resolve(this);
                    return;
                }

                const DBColumnName = translation[0];
                const TranslationName = translation[1];

                let data = this.get(`${TranslationName}`);

                if (data == null) {
                    //console.log("Using Default Data!")
                    data = DefaultDatas[i];
                } else {
                    //console.log("Using Object Data!")
                }

                if (i > 0) {
                    search += ` AND ${DBColumnName}=${data}`
                } else {
                    search = `${DBColumnName}=${data}`
                }
            }

            const SQL = `SELECT * FROM ${this._options.table} WHERE ${search}`

            this._DB.query(SQL).then(row => {
                this.ParseData(row);
                return this.BuildLinks();
            }).then(() => {
                resolve(this);
            }).catch(reject);
        })
    }

    BuildLinks() {
        return new Promise((resolve, reject) => {

            if (this._options.links == null || this._options.links.length == 0) {
                resolve();
                return;
            }

            this._options.links.forEach(link => {
                const DataPath = link[0];
                const DBTable = link[1]
                const Linkage = link[2];
                const LinkModelClass = link[3];

                const Data = this.get(Linkage[0]);
                const SQLSearch = `${Linkage[1]}=${Data}`

                const SQL = `SELECT * FROM ${DBTable} WHERE ${SQLSearch}`
                    //console.log(SQL)

                this._DB.query(SQL).then(rows => {

                    const promises = [];
                    rows.forEach(row => {
                        const LinkModel = new LinkModelClass(this._DB);
                        LinkModel.ParseData(row);
                        promises.push(LinkModel.retrieve());
                    })

                    Promise.all(promises).then(Models => {
                        for (let i = 0; i < Models.length; i++) {
                            const Model = Models[i];
                            this.set(`${DataPath}.${i}`, Model);
                        }
                        resolve();
                    })

                }).catch(reject)
            })
        })
    }

}

module.exports.Model = MySQLModel;

module.exports.TYPES = TYPES;