class MySQLModel {
    constructor(DB, options){
        this._DB=DB;
        this._options = options;
        this._data = {};
        console.log(this._options);
    }

    ParseMySQLData(data) {
        this._options.translations.forEach(translation => {
            this._data[translation[1]] = data[translation[0]];
        })
        console.log(this._data);
    }
}

module.exports.Model = MySQLModel;

module.exports.TYPES = {};


