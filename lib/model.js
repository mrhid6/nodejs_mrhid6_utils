const objectpath = require("object-path");
const QueryTypes = require("./DB/databasehelper").QueryTypes;

const TYPES = {
    STRING: 1,
    NUMBER: 2,
    FLOAT: 3,
    BOOLEAN: 4,
    DATE: 5,
    TIMESTAMP: 6,
    SINGLE: 15,
    MANY: 16,
    OTHER: 99
};

class ModelSave {
    constructor(DBColumnName, Value, TranslationType) {
        this._columnName = DBColumnName;
        this._value = Value;
        this._saved = false;
        this._valuetype = TranslationType;
    }

    getColumnName() {
        return this._columnName;
    }

    getValue() {
        return this._value;
    }

    getValueType() {
        return this._valuetype;
    }

    IsSaved() {
        return this._saved;
    }
}

class ModelTranslation {
    constructor(DBColumnName, VariableName, Type, DefaultValue = null) {
        this._columnName = DBColumnName;
        this._name = VariableName;
        this._type = Type;
        this._defaultValue = DefaultValue;
    }

    getColumnName() {
        return this._columnName;
    }

    getName() {
        return this._name;
    }

    getType() {
        return this._type;
    }

    getDefaultValue() {
        return this._defaultValue;
    }
}

class Model {
    constructor(DB, options) {
        this._DB = DB;

        const defaultOptions = {
            table: "",
            readonly: false,
            candeletefromdb: true,
            translations: [],
            links: []
        }
        this._options = Object.assign({}, defaultOptions, options);
        this._data = {};
        this._savedata = [];
    }

    setReadonly(readonly) {
        this._options.readonly = readonly;
    }

    isReadonly() {
        return this._options.readonly;
    }

    CanBeDeletedInDB() {
        return this._options.candeletefromdb;
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


            const DBColumnName = translation.getColumnName();
            const TranslationName = translation.getName();
            const TranslationType = translation.getType();
            const indexStr = (index > -1 ? `${index}.` : "");


            const DataValue = index > -1 ? data[index][DBColumnName] : data[DBColumnName];

            if (DataValue == null) {
                this.set(`${indexStr}${TranslationName}`, translation.getDefaultValue());
                return;
            } else {
                if (TranslationType == TYPES.STRING && DataValue == "") {
                    this.set(`${indexStr}${TranslationName}`, translation.getDefaultValue());
                    return;
                }
            }

            if (TranslationType == null) {
                this.set(`${indexStr}${TranslationName}`, DataValue);
            } else {
                if (TranslationType == TYPES.BOOLEAN) {
                    this.set(`${indexStr}${TranslationName}`, (DataValue == 1));
                } else if (TranslationType == TYPES.DATE) {
                    this.set(`${indexStr}${TranslationName}`, new Date(DataValue));
                } else if (TranslationType == TYPES.TIMESTAMP) {
                    this.set(`${indexStr}${TranslationName}`, new Date(parseInt(DataValue)));
                } else if (TranslationType == TYPES.NUMBER) {
                    if (isNaN(DataValue) == false) {
                        this.set(`${indexStr}${TranslationName}`, parseInt(DataValue));
                    }
                } else if (TranslationType == TYPES.FLOAT) {
                    if (isNaN(DataValue) == false) {
                        this.set(`${indexStr}${TranslationName}`, parseFloat(DataValue));
                    }
                } else if (TranslationType == TYPES.STRING) {
                    this.set(`${indexStr}${TranslationName}`, `${DataValue}`);
                } else {
                    this.set(`${indexStr}${TranslationName}`, DataValue);
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

    setAndSave(key, value, force = false) {

        if (this.isReadonly()) {
            return;
        }

        const translation = this._options.translations.find(t => t.getName() == key)
        if (force == false) {
            if (translation != null) {

                if (translation.getType() == TYPES.TIMESTAMP || translation.getType() == TYPES.DATE) {

                    const currentValue = this.get(key);

                    if (currentValue == null || currentValue.getTime() == value.getTime()) {
                        return;
                    }
                } else if (this.get(key) == value) {
                    return;
                }

            } else {
                return;
            }
        }

        this.set(key, value);


        if (translation != null) {
            const DBColumnName = translation.getColumnName();
            const TranslationType = translation.getType();
            const SaveModelData = new ModelSave(DBColumnName, value, TranslationType);

            this._savedata.push(SaveModelData);
        }
    }

    getSearchData() {
        return {
            conditions: [],
            value: []
        }
    }

    retrieve(DBColumns, DefaultDatas) {
        return new Promise((resolve, reject) => {
            let search = "";
            for (let i = 0; i < DBColumns.length; i++) {
                const DBColumn = DBColumns[i];
                const translation = this._options.translations.find(t => t.getColumnName() == DBColumn)

                if (translation == null) {
                    resolve(this);
                    return;
                }

                const DBColumnName = translation.getColumnName();
                const TranslationName = translation.getName();

                let data = this.get(`${TranslationName}`);

                if (data == null) {
                    //console.log("Using Default Data!")
                    data = DefaultDatas[i];
                } else {
                    //console.log("Using Object Data!")
                }

                if (i > 0) {
                    search += ` AND ${DBColumnName}='${data}'`
                } else {
                    search = `${DBColumnName}='${data}'`
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
            const linkPromises = []
            this._options.links.forEach(link => {
                linkPromises.push(this.BuildLink(link))
            })

            Promise.all(linkPromises).then(() => {
                resolve();
            })
        })
    }

    BuildLink(link) {
        return new Promise((resolve, reject) => {
            const DataPath = link[0];
            const DBTable = link[1]
            const Linkage = link[2];
            const LinkModelClass = link[3];
            const LinkType = link[4] || TYPE.SINGLE;

            const Data = this.get(Linkage[0]);
            const SQLSearch = `${Linkage[1]}='${Data}'`

            const SQL = `SELECT * FROM ${DBTable} WHERE ${SQLSearch}`
                //console.log(SQL)

            this._DB.query(SQL).then(rows => {

                if (rows.length == 0) {
                    if (LinkType == TYPES.SINGLE) {
                        this.set(`${DataPath}`, null);
                    } else {
                        this.set(`${DataPath}`, []);
                    }
                    resolve();
                    return;
                }

                const promises = [];
                rows.forEach(row => {
                    const LinkModel = new LinkModelClass(this._DB);
                    LinkModel.ParseData(row);
                    if (this.isReadonly()) {
                        LinkModel.setReadonly(true)
                    }
                    promises.push(LinkModel.retrieve());
                })

                Promise.all(promises).then(Models => {

                    if (Models.length == 1 && LinkType == TYPES.SINGLE) {
                        const tempModel = Models[0];
                        this.set(`${DataPath}`, tempModel);
                    } else {

                        for (let i = 0; i < Models.length; i++) {
                            const tempModel = Models[i];
                            this.set(`${DataPath}.${i}`, tempModel);
                        }
                    }
                    resolve();
                })

            }).catch(reject)
        });
    }

    SaveToDB() {
        return new Promise((resolve, reject) => {

            if (this.isReadonly()) {
                resolve();
                return;
            }

            const promises = [];
            this._savedata.forEach(SaveData => {

                if (SaveData.IsSaved()) {
                    return;
                }

                let SaveDataValue = SaveData.getValue();

                if (SaveData.getValueType() == TYPES.TIMESTAMP) {
                    SaveDataValue = SaveDataValue.getTime();
                }

                if (SaveData.getValueType() == TYPES.BOOLEAN) {
                    SaveDataValue = (SaveDataValue == true ? 1 : 0);
                }

                const DBData = [SaveDataValue]
                const Update = `${SaveData.getColumnName()}='${SaveDataValue}'`

                const searchData = this.getSearchData();
                let search = ""
                for (let i = 0; i < searchData.conditions.length; i++) {
                    const condition = searchData.conditions[i];
                    if (i > 0) {
                        search += ` AND ${condition}='${searchData.value[i]}'`
                    } else {
                        search = `${condition}='${searchData.value[i]}'`
                    }
                }

                const SQL = `UPDATE ${this._options.table} SET ${Update} WHERE ${search}`
                promises.push(this._DB.query(SQL, DBData))
                SaveData._saved = true;
            })

            Promise.all(promises).then(() => {
                resolve();
            }).catch(reject)
        });
    }

    CreateInDB() {
        return new Promise((resolve, reject) => {

            let InsertSQL = `INSERT INTO ${this._options.table} (`
            const values = [];
            this._options.translations.forEach(translation => {


                const DBColumnName = translation.getColumnName();
                const TranslationName = translation.getName();
                const TranslationType = translation.getType();

                let value = this.get(`${TranslationName}`)

                if (TranslationType == TYPES.TIMESTAMP) {
                    value = value.getTime();
                }

                if (TranslationType == TYPES.BOOLEAN) {
                    value = (value == true ? 1 : 0);
                }

                values.push(value)

                InsertSQL += `${DBColumnName},`

            });

            InsertSQL = InsertSQL.substring(0, InsertSQL.length - 1);
            InsertSQL += `) VALUES (${values.map(v=>"?")})`
            this._DB.query(InsertSQL, values, QueryTypes.RUN).then(rows => {
                resolve(rows.insertId);
            }).catch(reject)
        });
    }

    DeleteFromDB() {
        return new Promise((resolve, reject) => {
            const searchData = this.getSearchData();
            let search = ""
            for (let i = 0; i < searchData.conditions.length; i++) {
                const condition = searchData.conditions[i];
                if (i > 0) {
                    search += ` AND ${condition}='${searchData.value[i]}'`
                } else {
                    search = `${condition}='${searchData.value[i]}'`
                }
            }


            const SQL = `DELETE FROM ${this._options.table} WHERE ${search}`
            console.log(SQL)

            const promises = [];
            this._options.links.forEach(link => {
                this.DeleteLinkFromDB(link);
            })

            //this._DB.query(SQL, QueryTypes.EXEC).then(() => {
            resolve();
            //})

        })
    }

    DeleteLinkFromDB(link) {
        return new Promise((resolve, reject) => {
            const DataPath = link[0];
            const DBTable = link[1]
            const Linkage = link[2];
            const LinkModelClass = link[3];
            const LinkType = link[4] || TYPES.SINGLE;

            const DataModel = this.get(DataPath);
            const promises = [];
            if (DataModel != null) {
                if (LinkType == TYPES.SINGLE) {
                    if (DataModel.CanBeDeletedInDB()) {
                        promises.push(DataModel.DeleteFromDB())
                    }
                } else {
                    for (let i = 0; i < DataModel.length; i++) {
                        const dModel = DataModel[i];
                        if (dModel.CanBeDeletedInDB()) {
                            promises.push(dModel.DeleteFromDB())
                        }
                    }
                }
            }

            Promise.all(promises).then(() => {
                resolve();
            })
        });
    }


    toJson() {}

    fromJson() {}

}

module.exports.Model = Model;
module.exports.Translation = ModelTranslation;
module.exports.TYPES = TYPES;