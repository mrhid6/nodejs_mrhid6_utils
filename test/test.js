const Mrhid6Utils = require("../index.js");

const iUserModel = require("./test_mysqlmodel");

const Config = new Mrhid6Utils.Config({
    configPath: __dirname,
    filename: "test_config.json"
});

Config.load().then(() => {
    const MysqlHelper = new Mrhid6Utils.DB.MySQL(Config);

    MysqlHelper.init().then(() => {
        MysqlHelper.setScriptsDirectory(__dirname)
        const uModel = new iUserModel(MysqlHelper);
        uModel.ParseData({
            user_id: 50
        });

        uModel.CreateInDB();


    }).catch(err => {
        console.log(err);
    })
})