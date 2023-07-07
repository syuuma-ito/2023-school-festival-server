const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

const socketOptions = {
    cors: {
        origin: "*",
        credentials: true,
    },
};

const io = new Server(httpServer, socketOptions);

app.get("/", function (request, response) {
    response.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
    console.log("connection : " + socket.id);
    socket.on("disconnect", () => {
        console.log("disconnect");
    });
    socket.onAny((eventName, ...args) => {
        console.log(`イベントを受信しました ${eventName}`);

        io.emit(eventName, ...args);
    });
});

console.log("=== sever start ===");

httpServer.listen(4000);
