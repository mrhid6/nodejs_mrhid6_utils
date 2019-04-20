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
        const namespace = socket.nsp.name;
        const Packet = this.createPacket(event, data, socket);

        if (this._debugTriggeredEvents) {
            console.log(Packet);
        }
        if (this._eventHandlers[namespace] == null) {
            if (this._debugTriggeredEvents) {
                console.log("Called NetworkEvent: Namespace " + namespace + " Not registerd!");
            }
        }

        if (this._eventHandlers[namespace][event] != null) {
            for (var i = 0; i < this._eventHandlers[namespace][event].length; i++) {
                var func = this._eventHandlers[namespace][event][i];
                func(Packet);
            }
        } else {
            if (this._debugTriggeredEvents) {
                console.log("Called NetworkEvent:" + namespace + ":" + event + " But not registered!");
            }
        }
    }

    addEventHandler(namespace, event, func) {

        if (this._eventHandlers[namespace] == null) this._eventHandlers[namespace] = [];

        if (this._eventHandlers[namespace][event] == null) this._eventHandlers[namespace][event] = [];
        console.log("Event: " + event + " was added to net event handler!");
        this._eventHandlers[namespace][event].push(func);
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
        this.sendPacket(Packet);
    }

    sendClientPacket(Packet) {
        Packet.setPacketSocket(this._socket);
        this.sendPacket(Packet);
    }

    sendPacket(Packet) {
        const socket = Packet.getPacketSocket();
        if (socket == null) throw new Error("Socket Can't be null!");
        if (this._connected == false) {
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