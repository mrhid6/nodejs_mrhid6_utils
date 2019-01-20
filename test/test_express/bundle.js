(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const iPacket = require("./packet");

class Network {
    constructor(type) {
        this._type = type;
        this._eventHandlers = [];
        this._debugTriggeredEvents = false;
    }

    getPacketPrefix() {
        switch (this._type) {
            case Network.TYPE.SERVER:
                return "packet.server."
            case Network.TYPE.CLIENT:
                return "packet.client."
        }
    }

    triggerEvent(socket, event, data) {
        const Packet = this.createPacket(event, data, socket);
        if (this._debugTriggeredEvents) {
            console.log(Packet);
        }

        if (this._eventHandlers[event] != null) {
            for (var i = 0; i < this._eventHandlers[event].length; i++) {
                var func = this._eventHandlers[event][i];
                func(Packet);
            }
        } else {
            if (this._debugTriggeredEvents) {
                console.log("Called NetworkEvent:" + event + " But not registered!");
            }
        }
    }

    addEventHandler(event, func) {
        if (this._eventHandlers[event] == null) this._eventHandlers[event] = [];
        console.log("Event: " + event + " was added to net event handler!");
        this._eventHandlers[event].push(func);
    };

    createPacket(name, data, socket) {
        const Packet = new iPacket(name, data, socket);
        return Packet;
    }

    createPrefixedPacket(name, data, socket) {
        const prefixedName = this.getPacketPrefix() + name
        return this.createPacket(prefixedName, data, socket);
    }

    sendServerPacket(Packet) {
        const socket = Packet.getPacketSocket();
        if (socket == null) throw new Error("Socket Can't be null!");
        if (socket.connected == false) {
            socket.disconnect();
            return;
        }
        socket.emit(Packet.getPacketName(), Packet.getPacketData());
    }
}

Network.TYPE = {
    SERVER: 1,
    CLIENT: 2
}

module.exports = Network;
},{"./packet":3}],2:[function(require,module,exports){
const Network = require("./network");
class NetworkClient extends Network {
    constructor() {
        super(Network.TYPE.CLIENT);
        this._socket = null;
        this._connected = false;
    }

    startClientConnection(address, options) {
        const default_options = {
            reconnection: true,
            reconnectionAttempts: 2,
            timeout: 10000
        };

        const socket_options = Object.assign({}, default_options, options);

        this._socket = io(address, socket_options);
        this.setupSocketEventListeners();
    }

    setupSocketEventListeners() {
        this._socket.on("connect", () => {
            this._connected = true;
            this.triggerEvent(null, "connect", null);
        });
        this._socket.on("disconnect", () => {
            this._connected = false;
            this.triggerEvent(null, "disconnect", null);
        });

        this._socket.on('connect_error', () => {
            this._connected = false;
            this.triggerEvent(null, "connect_failed", null);
        });

        this._socket.on('connect_timeout', () => {
            this._connected = false;
            this.triggerEvent(null, "connect_failed", null);
        });

        var onevent = this._socket.onevent;
        this._socket.onevent = function (packet) {
            var args = packet.data || [];
            onevent.call(this, packet); // original call
            packet.data = ["*"].concat(args);
            onevent.call(this, packet); // additional call to catch-all
        };

        this._socket.on("*", (event, data) => {
            this.triggerEvent(null, event, data);
        });
    }
}

module.exports = NetworkClient;
},{"./network":1}],3:[function(require,module,exports){
class Packet {
    constructor(packetName, packetData, packetSocket) {
        this._packetName = packetName;
        this._packetData = packetData;
        this._packetSocket = packetSocket;
    }

    getPacketName() {
        return this._packetName
    }

    getPacketData() {
        return this._packetData
    }

    getPacketSocket() {
        return this._packetSocket;
    }
}

module.exports = Packet;
},{}],4:[function(require,module,exports){
const net = new(require("../../lib/networkclient"));

net._debugTriggeredEvents = true;

net.addEventHandler("packet.server.test", function (packet) {
    console.log(packet);
});

net.startClientConnection("http://localhost:3000");
console.log(net);
},{"../../lib/networkclient":2}]},{},[4]);
