const express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const sharedsession = require("express-socket.io-session");

const Mrhid6Utils = require("../../index");
const NET = new Mrhid6Utils.NetworkServer();

function createExpressServer() {
    server.listen(3000, function () {
        console.log("Listening on 3000..");
    });

    app.use("/browserify", express.static(__dirname + "/../../node_modules/browserify"));
    app.use("/lib", express.static(__dirname + "/../../lib"));
    app.use("/", express.static(__dirname));
    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/index.html');
    });

    NET.startClientListener(io);
}

createExpressServer();