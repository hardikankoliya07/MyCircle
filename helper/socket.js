module.exports = function (server) {
    global.io = require("socket.io")(server);
    io.on("connection", (socket) => {
        socket.join(socket.handshake.query.uuId);
    });
}