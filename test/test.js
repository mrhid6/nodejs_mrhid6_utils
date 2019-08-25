const Mrhid6Utils = require("../index.js");

const options = {
    serialize_data: true
}

const RedisHelper = new Mrhid6Utils.RedisHelper(options);


RedisHelper.checkDataInRedis("Test").then(check_result => {
    if (check_result == false) {
        RedisHelper.saveDataInRedis("Test", "hello!").then(() => {
            console.log("Saved!")
        })
    } else {
        RedisHelper.getDataFromRedis("Test").then(data => {
            console.log(data)
        });
    }
}).catch(err => {
    console.log(err);
});