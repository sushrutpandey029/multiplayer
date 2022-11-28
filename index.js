const express = require("express");
const app = express();
const Room = require("./models/room");
// const httpServer = require("http").Server(app);
// const { Server } = require("socket.io");
const roomRoutes = require("./routes/room")


const server = require("http").createServer(app);
const io = require("socket.io")(server);
const dotenv = require("dotenv")
dotenv.config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

mongoose
  .connect(
    "mongodb+srv://admin:admin123@cluster0.lo755an.mongodb.net/ludo?retryWrites=true&w=majority"
  )
  .then(
    () => {
      console.log("mongodb connected...");
    },
    (err) => console.log(err)
  );

var roomJoinees = {};

// const io = require
// const httpServer = createServer(app);
// const io = new Server(httpServer, {
//   cors: {
//     origin: "https://frozen-fortress-11007.herokuapp.com/",
//   },
// });

app.set("views", "./views");

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

// const rooms = { }


// setInterval(async () => {
//   // console.log("hi");
//   setTimeout(async() => {
//     const rooms = await Room.find();
//     rooms.forEach(async room => {
//       if (room.joinee.length<1) {
//         console.log(room);
//         await Room.deleteOne(room._id);
//       }
//     })
//   }, 500);
// }, 1000);

setTimeout(() => {
  setInterval(async () => {
    const rooms = await Room.find();
    rooms.forEach(async room => {
      if (room.joinee.length<1) {
        // console.log(room);
        await Room.deleteOne(room._id);
      }
    })
  }, 10000);
}, 5000);


// api routes


app.use("/api", roomRoutes);


app.get("/", async (req, res) => {
  try {
    const rooms = await Room.find();
      res.render("index", { rooms: rooms });
      // console.log(rooms);
  } catch (err) {}
});

app.get("/:room", async (req, res) => {
  try {
      const room = await Room.findById(req.params.room);
    //   console.log(room);
    if (room.joinee.length < 4)
      res
        .status(200)
        .render("room", {
          roomId: room._id,
          roomName: room.roomName,
          roomJoinee: room.joinee,
        });
    else {
      console.log("room capacity reached... try joining another room");
      //  res.status(200).redirect("/");
    }
  } catch (err) {
    // res.status(500).json({ "err": err });
    return res.redirect("/");
  }
  // res.render('room', {roomName: req.params.room})
});

app.post("/room", async (req, res) => {
  try {
    const newroom = new Room({
      roomName: req.body.roomName,
    });

    const room = await newroom.save();
    res.status(200).redirect(room._id);
    io.emit("room-created", room);
  } catch (err) {
    res.status(500).json({ err: err });
  }

  // if (rooms[req.body.room] != null) {
  //     return res.redirect('/')
  // }
  // rooms[req.body.room] = {users: {}}
  // res.redirect(req.body.room)

  //send message when new room was created
});
// Server

const users = {};

io.on("connection", (socket) => {
  console.log("server " + socket.id);
  // socket.emit("chat-message", "hello World");
  socket.on("new-user", async (roomId, data) => {
    try {
      const room = await Room.findById(roomId);
      socket.join(roomId);
      room.joinee.push(socket.id);
      roomJoinees[socket.id] = data;
      socket.to(roomId).emit("new-user-alert", `${data}`);
      // socket.to(roomId).emit("userJoined", roomJoinees);
    //   socket.to(roomId).emit("total_user", `${data}`);
      await room.save();
    } catch (error) {
      console.log("connection err " + error);
    }
  });
  socket.on("send-chat-message", (room, name, message) => {
    // console.log(room, name, message);
    socket.to(room).emit("chat-message", { message: message, name: name });
  });

  socket.on("BtnStarted", async (index, roomId) => {
    console.log(index, roomId);
    const roomJoinees = await Room.findById(roomId);
    io.to(roomId).emit("turnChanged", {sid:roomJoinees.joinee[index], roomId: roomId, index: index+1})
  });

  socket.on("disconnect", async () => {
    try {
      const rooms = await Room.find();
        rooms.forEach(async (room, index) => {
          if (room.joinee.includes(socket.id)) {
              io.to(room._id).emit("user-disconnect", socket.id);
            room.joinee.splice(index, 1);
            console.log(socket.id + "disconnected" + room);
            console.log(socket.room);
            await room.save();
          }
        });
    } catch (err) {
      console.log(err);
    }
  });

//   async function getuser(sid) {
//     if (sid === socket.id) return sid;
//   }
});


// console.log(roomJoinees);

server.listen(process.env.PORT || 3000);
