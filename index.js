const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 3000;

const onlineUsers = new Set();

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  socket.on("setNickname", (nickname) => {
    socket.nickname = nickname;
    console.log(`User ${socket.nickname} connected`);

    onlineUsers.add(socket.nickname);

    io.emit("userJoined", socket.nickname);

    io.emit("onlineUsers", Array.from(onlineUsers));
  });

  socket.on("chatMessage", (message) => {
    console.log(`[${socket.nickname}]: ${message}`);

    io.emit("chatMessage", {
      nickname: socket.nickname,
      message: message,
    });
  });

  // Event handler for when a user disconnects
  socket.on("disconnect", () => {
    if (socket.nickname) {
      console.log(`User ${socket.nickname} disconnected`);
      // Remove the user from the online users set
      onlineUsers.delete(socket.nickname);

      // Broadcast to all connected clients that a user has left
      io.emit("userLeft", socket.nickname);

      // Send the updated list of online users to all clients
      io.emit("onlineUsers", Array.from(onlineUsers));
    }
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
