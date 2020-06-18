const iPacket = require("./packet");

class Network {
    constructor(type) {
        this._type = type;
        this._eventHandlers = [];
        this._debugTriggeredEvents = false;
        this._io = null;
    }

    getPacketPrefix() {
        switch (this._type) {
            case Network.TYPE.SERVER:
            case Network.TYPE.WSSERVER:
                return "packet.server."
            case Network.TYPE.CLIENT:
            case Network.TYPE.WSCLIENT:
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

    createResponsePacket(Packet, data) {
        const name = Packet.getPacketName().replace("packet.server.", "").replace("packet.client.", "");
        const newName = name + ".res";
        const newPacket = this.createPrefixedPacket(newName, data, Packet.getPacketSocket());
        return newPacket;
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
        const socketId = Packet.getPacketSocketId();

        if (socket == null && socketId == null) throw new Error("Socket Can't be null!");
        if (this._connected == false) {
            socket.disconnect();
            return;
        }

        if (socketId == null) {
            if (this._type == Network.TYPE.WSSERVER) {
                socket.send(Packet.toWSString());
            }
            socket.emit(Packet.getPacketName(), Packet.getPacketData());
        } else {
            const namespace = socketId.split("#")[0];
            this._io.of(namespace).to(socketId).emit(Packet.getPacketName(), Packet.getPacketData());
        }
    }

    sendPacketInNamespaceRoom(namespace, room, Packet) {
        this._io.of(namespace).in(room).emit(Packet.getPacketName(), Packet.getPacketData());
    }
    sendPacketToAllInNamespace(namespace, Packet) {
        this._io.of(namespace).emit(Packet.getPacketName(), Packet.getPacketData());
    }
}

Network.TYPE = {
    SERVER: 1,
    CLIENT: 2,
    WSSERVER: 3,
    WSCLIENT: 4
}

module.exports = Network;