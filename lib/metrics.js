const axios = require("axios").default;
const Tools = require("./tools");


class Metrics {
    constructor(opts) {
        const default_options = {
            appid: "",
            client_uuid: ""
        }
        this._options = Object.assign({}, default_options, opts);
        //this._METRICS_URL = "https://metrics.hostxtra.co.uk/api"
        this._METRICS_URL = "http://localhost:3028/api"
    }

    createUUID() {
        const uuid = Tools.generateUUID("XXX-XXXXXXX-XXXX");
        this._options.client_uuid = uuid;
    }

    getUUID() {
        if (this._options.client_uuid == "") {
            this.createUUID();
        }
        return this._options.client_uuid;
    }

    createEvent(event_category, value) {
        return new Promise((resolve, reject) => {
            const url = this._METRICS_URL + "/event"


            const postData = {
                ec: event_category,
                val: value,
                cuuid: this.getUUID()
            };

            const config = {
                headers: {
                    "metrics-app-token": this._options.appid
                }
            }

            axios.post(url, postData, config).then((res) => {
                if (res.data == null) {
                    reject("server error");
                    return;
                }

                resolve(res.data)
            }).catch(err => {
                reject(err);
            })
        })
    }
}

module.exports = Metrics;