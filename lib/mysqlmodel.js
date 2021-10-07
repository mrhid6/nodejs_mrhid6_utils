const e = require("express");
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
        if (Array.isArray(data) == true) {
            let index = 0;
            this._data = [];
            data.forEach(d => {
                this._ProcessMySQLData(data, index);
                index++;
            })
        } else {
            this._ProcessMySQLData(data);
        }
        console.log(this._data);
    }

    _ProcessMySQLData(data, index = -1) {
        this._options.translations.forEach(translation => {

            const DBColumnName = translation[0];
            const TranslationName = translation[1];
            const TranslationType = translation[2];
            const indexStr = (index > -1 ? `${index}.` : "");


            const DataValue = index > -1 ? data[index][DBColumnName] : data[DBColumnName];

            if (TranslationType == null) {
                this.set(`${indexStr}${TranslationName}`, DataValue);
            } else {
                if (TranslationType == TYPES.BOOLEAN) {
                    this.set(`${indexStr}${TranslationName}`, (DataValue == 1));
                }

                if (TranslationType == TYPES.DATE) {
                    this.set(`${indexStr}${TranslationName}`, new Date(DataValue));
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
}

module.exports.Model = MySQLModel;

module.exports.TYPES = TYPES;