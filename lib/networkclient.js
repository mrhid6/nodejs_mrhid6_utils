const Network = require("./network");
class NetworkClient extends Network {
    constructor() {
        super(Network.TYPE.CLIENT);
        this._socket = null;
        this._connected = false;
    }

    startClientConnection(address, io, options) {
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