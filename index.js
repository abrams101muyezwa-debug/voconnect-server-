const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  socket.on("join", (room) => {
    socket.join(room);
    socket.to(room).emit("peer-joined", { id: socket.id });
  });

  socket.on("signal", ({ room, to, data }) => {
    if (to) {
      io.to(to).emit("signal", { from: socket.id, data });
    } else {
      socket.to(room).emit("signal", { from: socket.id, data });
    }
  });

  socket.on("leave", (room) => {
    socket.leave(room);
    socket.to(room).emit("peer-left", { id: socket.id });
  });

  socket.on("disconnect", () => {
    console.log("disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`VoConnect signaling server running on ${PORT}`));
