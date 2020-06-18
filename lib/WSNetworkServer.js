const iNetwork = require("./network");

class WSNetwork extends iNetwork {
    constructor() {
        super(iNetwork.TYPE.WSSERVER);
        console.log(this._type);
        this._wss = null;
        this._SOCKETS = [];
    }

    init(wss) {
        this._wss = wss;
        this.SetupConnectionHandlers();
    }

    SetupConnectionHandlers() {
        this._wss.on('connection', (client) => {
            this.newClientConnection(client)
        });

        this._wss.on('close', function close() {
            clearInterval(interval);
        });

        const interval = setInterval(() => {
            this._wss.clients.forEach(ws => {
                if (ws.isAlive === false) return ws.terminate();

                ws.isAlive = false;
                ws.ping(noop);
            });
        }, 20000);
    }

    newClientConnection(client) {
        console.log("New WSS Connection!");

        this.triggerEvent(client, "connection", null);
        client.on('close', () => {
            this.triggerEvent(client, 'disconnect', null)
        })

        client.isAlive = true;
        client.on('pong', heartbeat);

        client.on('message', (message) => {
            if (message == "") return;
            if (!IsJsonString(message)) {
                console.log("Invalid Json!");
                return;
            }
            const JSONData = JSON.parse(message);
            const eventName = JSONData.event;
            const data = JSONData.data;

            if (IsJsonString(data)) {
                data = JSON.parse(data);
            }

            if (eventName == null) {
                return;
            }
            this.triggerEvent(client, eventName, data);
        });
    }

    broadcastPacket(Packet) {
        this._wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(Packet.toWSString());
            }
        });
    }


}


function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function noop() {}

function heartbeat() {
    console.log("Pong!")
    this.isAlive = true;
}


module.exports = WSNetwork;