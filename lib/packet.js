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

    setPacketName(packetName) {
        this._packetName = packetName;
    }

    setPacketData(packetData) {
        this._packetData = packetData;
    }

    setPacketSocket(packetSocket) {
        this._packetSocket = packetSocket;
    }
}

module.exports = Packet;