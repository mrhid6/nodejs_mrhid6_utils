const net = new(require("../../lib/networkclient"));

net._debugTriggeredEvents = true;

net.addEventHandler("packet.server.test", function (packet) {
    console.log(packet);
});

net.startClientConnection("http://localhost:3000");
console.log(net);