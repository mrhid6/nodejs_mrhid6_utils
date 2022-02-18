const Mrhid6Utils = require("../");
const Metrics = new Mrhid6Utils.Metrics({
    appid: "APP-189WI4M396JD72",
    client_uuid: "Blt-nE5SZn1-HIl2"
})

Metrics.createEvent(1, "Test", 1)

console.log(Metrics)