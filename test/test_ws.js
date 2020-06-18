const WebSocket = require('ws');
const express = require("express");
const app = express();

const http = require("http").Server(app)

const Mrhid6Utils = require("../index.js")
const WSNetworkServer = new Mrhid6Utils.WSNetworkServer();


const wss = new WebSocket.Server({ server:http });
WSNetworkServer.init(wss);

WSNetworkServer.addEventHandler("packet.client.test", Packet=>{
	const pres = WSNetworkServer.createResponsePacket(Packet, "world");
	WSNetworkServer.sendPacket(pres);
});

http.listen(3400, ()=>{
   console.log("listening on 3400");
});
