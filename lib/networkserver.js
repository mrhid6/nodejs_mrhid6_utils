const Network = require("./network");

class NetworkServer extends Network {
    constructor() {
        super(Network.TYPE.SERVER);
        this._SOCKETS = [];
        this._io = null;
    }

    startClientListener(io) {
        this._io = io;
        this._io.sockets.on('connection', (socket) => this.newClientConnection(socket));
        console.log("NetworkServer Started!");
    }

    newClientConnection(socket) {
        this._SOCKETS.push(socket);
        this.triggerEvent(socket, "connection", null);

        socket.on("disconnect", (socket) => {
            var sockIndex = this._SOCKETS.indexOf(socket);
            this._SOCKETS.splice(sockIndex, 1);

            this.triggerEvent(socket, "disconnect", null);
        });

        var onevent = socket.onevent;
        socket.onevent = function (packet) {
            var args = packet.data || [];
            onevent.call(this, packet); // original call
            packet.data = ["*"].concat(args);
            onevent.call(this, packet); // additional call to catch-all
        };

        socket.on("*", (event, data) => {
            this.triggerEvent(socket, event, data);
        });

        const Packet = this.createPrefixedPacket("test", 1, socket);
        this.sendServerPacket(Packet);
    }

    sendPacketToAll(event, data) {
        var prefix = this.getPacketPrefix();
        this._io.sockets.emit(prefix + event, data);
    };

    setCurrentPage(data, socket) {
        socket.currentpage = data;
    };

    getSocketByClientID(id) {
        for (var i = 0; i < this._SOCKETS.length; i++) {
            var socket = this._SOCKETS[i];
            if (socket.clientid == id) return socket
        }
        return null;
    };

    getAllServerSockets() {
        return this._SOCKETS;
    };

    disconnectAllFromServer() {
        for (var i = 0; i < this._SOCKETS.length; i++) {
            var socket = this._SOCKETS[i];
            socket.disconnect();
        }
    };
}

module.exports = NetworkServer;