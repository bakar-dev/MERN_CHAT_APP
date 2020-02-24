const express = require("express");
const socketio = require("socket.io");
const http = require("http");

const router = require("./router");
const { addUser, getUser, getUsersInRoom, removeUser } = require("./users");

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", socket => {
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to the room ${user.room}`
    });
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name}, has joined!` });

    socket.join(user.room);

    callback();
  });

  // user send message event
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    console.log("here", user);
    io.to(user.room).emit("message", { user: user.name, text: message });

    callback();
  });

  socket.on("disconnet", () => {
    console.log("User disconnected...");
  });
});

app.use(router);

server.listen(PORT, () => console.log(`Server Running on Port: ${PORT}`));
