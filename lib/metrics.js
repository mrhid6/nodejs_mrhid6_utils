const axios = require("axios").default;
const Tools = require("./tools");


class Metrics{
    constructor(opts){
	const default_options = {
		appid: "",
		client_uuid: ""
        }
        this._options = Object.assign({}, default_options, opts);
	this._METRICS_URL="https://metrics.hostxtra.co.uk/api"
    }

    createUUID(){
        const uuid = Tools.generateUUID("XXX-XXXXXXX-XXXX");
	this._options.client_uuid = uuid;
    }

    getUUID(){
        if(this._options.client_uuid == ""){
            this.createUUID();
	}
	return this._options.client_uuid;
    }

    createEvent(event_category, name, value){
	const url = this._METRICS_URL + "/event"

	
	axios.post(url, {
	    ec_id: event_category,
	    event_name: name,
	    event_value: value,
	    client_uuid: this.getUUID()
	}).then(()=>{
	    console.log("sent event!");
	})
    }
}

module.exports = Metrics;
