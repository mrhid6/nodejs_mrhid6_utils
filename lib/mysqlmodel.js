const objectpath = require("object-path");


const TYPES = {
    STRING: 1,
    NUMBER: 2,
    BOOLEAN: 3,
    DATE: 4
};

class MySQLModel {
    constructor(DB, options) {
        this._DB = DB;
        this._options = options;
        this._data = {};
    }

    ParseMySQLData(data) {
        this._options.translations.forEach(translation => {

            const DBColumnName = translation[0];
            const TranslationName = translation[1];
            const TranslationType = translation[2];


            if (TranslationType == null) {
                this.set(TranslationName, data[DBColumnName]);
            } else {
                if (TranslationType == TYPES.BOOLEAN) {
                    this.set(TranslationName, (data[DBColumnName] == 1));
                }

                if (TranslationType == TYPES.DATE) {
                    this.set(TranslationName, new Date(data[DBColumnName]));
                }
            }
        })
        console.log(this._data);
    }

    get(key) {
        return objectpath.get(this._data, key);
    }

    set(key, val) {
        objectpath.set(this._data, key, val);
    }
}

module.exports.Model = MySQLModel;

module.exports.TYPES = TYPES;