class Packet {
    constructor(packetName, packetData, packetSocket) {
        this._packetName = packetName;
        this._packetData = packetData;
        this._packetSocket = packetSocket;
        this._packetSocketId = null;
    }

    getPacketName() {
        return this._packetName;
    }

    getPacketData() {
        return this._packetData;
    }

    getPacketSocket() {
        return this._packetSocket;
    }

    getPacketSocketId() {
        return this._packetSocketId;
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

    toWSString() {
        const json = {
            event: this.getPacketName(),
            data: this.getPacketData(),
        };
        return JSON.stringify(json);
    }
}

module.exports = Packet;
