const axios = require("axios").default;
const Tools = require("./tools");


class Metrics {
    constructor(opts) {
        const default_options = {
            appid: "",
            client_uuid: "",
            test_mode: false
        }
        this._options = Object.assign({}, default_options, opts);
        if (this._options.test_mode == true) {
            this._METRICS_URL = "https://metrics.hostxtra.co.uk/api"
        } else {
            this._METRICS_URL = "http://localhost:3028/api"
        }
    }

    /**
     * Create Client UUID
     */
    createUUID() {
        const uuid = Tools.generateUUID("XXX-XXXXXXX-XXXX");
        this._options.client_uuid = uuid;
    }


    /**
     * Getter for Client UUID
     * @returns {string} - Client UUID
     */
    getUUID() {
        if (this._options.client_uuid == "") {
            this.createUUID();
        }
        return this._options.client_uuid;
    }

    /**
     * Creates and sends an event to Metrics API Server
     * @param {number} event_category - Event Category ID
     * @param {*} value - Event Value
     * @returns {Promise} - Web Request Response
     */
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