////////////////////////////////////////////////////////////////////////////////////////////////////

//                                      SERVER FILE

///////////////////////////////////////////////////////////////////////////////////////////////////

// importing libraries of node js

const express = require("express");
const app = express();
const Room = require("./models/room");
const httpServer = require("http").Server(app);
const { Server } = require("socket.io");
const roomRoutes = require("./routes/room")
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
//mongodb connection

mongoose.connect("mongodb://localhost:27017/ludo").then(
  () => {
    console.log("mongodb connected...");
  },
  (err) => console.log(err)
);

var roomJoinees = {};

// creating socket io server

// const io = require
// const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://127.0.0.1:5500",
  },
});

// setting up express js

app.set("views", "./views");

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
// deleting room after 15sec if nobody is connected to the room


app.use(bodyParser.json());

setTimeout(() => {
  setInterval(async () => {
    const rooms = await Room.find();
    rooms.forEach(async (room) => {
      if (room.joinee.length < 1) {
        // console.log(room);
        await Room.deleteOne(room._id);
      }
    });
  }, 10000);
}, 15000);



app.use("/api",roomRoutes )

// home route for joining and creating room

app.get("/", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.render("index", { rooms: rooms });
    // console.log(rooms);
  } catch (err) {}
});

// room route for joining any room

app.get("/:room", async (req, res) => {
  try {
    const room = await Room.findById(req.params.room);
    //   console.log(room);
    if (room.joinee.length < 4)
      res.status(200).render("room", {
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

// post route for creating new room in DB

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
});




//


// Server

const users = {};

// socket io instance creation

// socket connection call back function

io.on("connection", (socket) => {
  // console.log("server " + socket.id);



  

  // HANDLING EVENT WHEN NEW USER IS ADDED TO SOCKET ROOM

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

  var userturn = {};

  // handeling send chat message event from server side

  socket.on("send-chat-message", async (room, name, message) => {
    console.log(room, name, message);
    socket.to(room).emit("chat-message", { message: message, name: name });
  });

  // WHEN CLIENT ASK FOR CHANGING TURN FROM SERVER SIDE

  socket.on("BtnStarted", async (index, roomId) => {
    console.log(index, roomId);
    const roomJoinees = await Room.findById(roomId);
    userturn.sid = roomJoinees.joinee[index];
    userturn.index = index;
    userturn.room = roomId;
    io.to(roomId).emit("turnChanged", {
      sid: roomJoinees.joinee[index],
      roomId: roomId,
      index: index + 1,
    });
  });

  // creating rpc event for the multiplayer system

  socket.on("rpc", (user_id, function_id, dice_rolled, piece_moved, roomId) => {
    io.to(roomId).emit("rpc-recived", {
      user_id: user_id,
      function_id: function_id,
      dice_rolled: dice_rolled,
      piece_moved: piece_moved,
      room: roomId,
    })
  })

  // WHEN CLIENT GETS DISCONNECTED TO SOCKET SERVER
  socket.on("disconnect", async () => {
    try {
      const rooms = await Room.find();
        rooms.forEach(async (room, index) => {
          if (room.joinee.includes(socket.id)) {
            const room_joinees = room.joinee;
            room_joinees.splice(room_joinees.indexOf(socket.id), 1);
            console.log(room._id.toString());
            
            io.to(room._id.toString()).emit("user-disconnect", socket.id);
            // console.log(socket.id + "disconnected" + room);
            await room.save();
          }
        });
    } catch (err) {
      console.log(err);
    }
  })

  
});


function  exitUser() {
  console.log("hi");
}










httpServer.listen(3000);
