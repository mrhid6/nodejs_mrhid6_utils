const iNetwork = require("./network");
const WebSocket = require("ws");

class WSNetwork extends iNetwork {
    constructor() {
        super(iNetwork.TYPE.WSSERVER);
        this._wss = null;
        this._SOCKETS = [];
        this._RequiresLogin = false;
        this._LoggedIn = false;
        this._LoginKey = "";

        this._EventsWithoutLoginLimit = 10;
    }

    init(wss) {
        this._wss = wss;
        this.SetupConnectionHandlers();
    }

    SetupConnectionHandlers() {
        this._wss.on("connection", (client) => {
            this.newClientConnection(client);
        });

        this._wss.on("close", function close() {
            clearInterval(interval);
        });

        const interval = setInterval(() => {
            this._wss.clients.forEach((ws) => {
                if (ws.isAlive === false) return ws.terminate();

                ws.isAlive = false;
                ws.ping(noop);
            });
        }, 20000);
    }

    newClientConnection(client) {
        console.log("New WSS Connection!");
        client.LoggedIn = false;

        this.triggerEvent(client, "connection", null);
        client.on("close", () => {
            this.triggerEvent(client, "disconnect", null);
        });

        client.isAlive = true;
        client.on("pong", heartbeat);

        client.on("message", (message) => {
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

            if (eventName == "packet.client.login") {
                this.LoginSocket(client, eventName, data);
            }
            if (this._RequiresLogin == true) {
                if (client.LoggedIn == true) {
                    this.triggerEvent(client, eventName, data);
                } else {
                    if (client.EventsWithoutLogin == null) {
                        client.EventsWithoutLogin = 0;
                    }
                    client.EventsWithoutLogin += 1;

                    if (
                        client.EventsWithoutLogin >=
                        this._EventsWithoutLoginLimit
                    ) {
                        client.terminate();
                    }
                }
            } else {
                this.triggerEvent(client, eventName, data);
            }
        });
    }

    LoginSocket(client, eventName, data) {
        if (data.LoginKey == null) {
            const ResData = {
                event: "packet.server.login",
                data: {
                    success: false,
                    error: "Login Key Is Null!",
                },
            };
            client.send(JSON.stringify(ResData));
            client.terminate();
            return;
        }

        if (data.LoginKey != this._LoginKey) {
            const ResData = {
                event: "packet.server.login",
                data: {
                    success: false,
                    error: "Login Key Mismatch!",
                },
            };
            client.send(JSON.stringify(ResData));
            client.terminate();
            return;
        }

        client.LoggedIn = true;
        const ResData = {
            event: "packet.server.login",
            data: {
                success: true,
            },
        };
        client.send(JSON.stringify(ResData));
    }

    broadcastPacket(Packet) {
        this._wss.clients.forEach((client) => {
            if (
                client.readyState === WebSocket.OPEN &&
                client.LoggedIn == true
            ) {
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
    console.log("Pong!");
    this.isAlive = true;
}

module.exports = WSNetwork;
