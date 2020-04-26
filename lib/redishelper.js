const redis = require("redis");
const bluebird = require("bluebird");
bluebird.promisifyAll(redis);

const Tools = require("./tools");

class RedisHelper {
    constructor(options) {
        const defaultOptions = {
            serialize_data: false
        }
        this._options = Object.assign(defaultOptions, options)


        this._client = redis.createClient();

        this._client.on("error", function (err) {
            console.log("Error:" + err)
        })
    }

    checkDataInRedis(redis_path) {
        return new Promise((resolve, reject) => {
            this._client.getAsync(redis_path).then(data => {
                resolve((data != null));
            }).catch(err => {
                reject(err);
            })
        })
    }

    getDataFromRedis(redis_path) {
        return new Promise((resolve, reject) => {
            this._client.getAsync(redis_path).then(data => {
                if (this._options.serialize_data == true) {
                    resolve(Tools.deserialize(data));
                } else {
                    resolve(data);
                }
            }).catch(err => {
                reject(err);
            })
        });
    }

    getDataFromRedisPlain(redis_path) {
        return new Promise((resolve, reject) => {
            this._client.getAsync(redis_path).then(data => {
                resolve(data);
            }).catch(err => {
                reject(err);
            })
        });
    }

    saveDataInRedis(redis_path, data) {
        return new Promise((resolve, reject) => {
            let new_data = "";
            if (this._options.serialize_data == true) {
                new_data = Tools.serialize(data);
            } else {
                new_data = data
            }

            this._client.watch(redis_path);
            this._client.multi().set(redis_path, new_data).execAsync().then(res => {
                resolve()
            }).catch(err => {
                reject(err);
            })
        })
    }
}

module.exports = RedisHelper;