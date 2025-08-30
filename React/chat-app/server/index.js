const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }, // allow frontend to connect
});

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // When a user sends a message
  socket.on("sendMessage", (msg) => {
    // Send message to everyone
    io.emit("receiveMessage", { id: socket.id, text: msg });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
