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