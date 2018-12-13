class NetworkServer {
    constructor() {
        this._SOCKETS = [];
        this._eventHandlers = [];
    }

    startClientListener(io) {

        self.server.SOCKETS = [];

        io.sockets.on('connection', (socket) => {

            this._SOCKETS.push(socket);
            this.triggerEvent(socket, "connection", null);

            socket.on("disconnect", (socket) => {
                var sockIndex = this._SOCKETS.indexOf(socket);
                this._SOCKETS.splice(sockIndex, 1);

                this.triggerEvent(socket, "disconnect", null);
            });

            var onevent = socket.onevent;
            socket.onevent = (packet) => {
                var args = packet.data || [];
                onevent.call(this, packet); // original call
                packet.data = ["*"].concat(args);
                onevent.call(this, packet); // additional call to catch-all
            };

            socket.on("*", (event, data) => {
                this.triggerEvent(socket, event, data);
            });
        });
    }

    triggerEvent(socket, event, data) {

        console.log(event);
        console.log(data);

        if (this._eventHandlers[event] != null) {
            for (var i = 0; i < this._eventHandlers[event].length; i++) {
                var func = this._eventHandlers[event][i];

                func(socket, event, data);
            }
        } else {
            console.log("Called EVENT:" + event + " But not registered!");
        }
    }

    addEventHandler(event, func) {
        if (this._eventHandlers[event] == null) this._eventHandlers[event] = [];
        console.log("Event: " + event + " was added to net event handler!");
        this._eventHandlers[event].push(func);
    };

    sendPacket(event, data, socket) {
        var prefix = "packet.server.";

        if (socket == null) throw new Error("Socket Can't be null!");

        if (socket.connected == false) socket.disconnect();
        if (socket.currentpage == "login") {
            if (event.startsWith("login.") || event.startsWith("session.") || event.startsWith("set.clientid")) {
                socket.emit(prefix + event, data);
            }
            return;
        }

        socket.emit(prefix + event, data);
    };

    sendPacketToAll(event, data) {
        for (var i = 0; i < this._SOCKETS.length; i++) {
            var socket = this._SOCKETS[i];
            this.sendPacket(event, data, socket);
        }
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