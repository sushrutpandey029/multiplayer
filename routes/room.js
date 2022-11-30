const router = require("express").Router();
const Room = require("../models/room");
router.get("/:room", async (req, res) => {
  try {
    const room = await Room.findById(req.params.room);
    res.status(200).json(room);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get("/getrooms", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.post("/join", async (req, res) => {
  try {
    const room = await Room.findById(req.body.roomId);
    if (room.joinee.length < 3) {
      room.joinee.push(req.body.user);
      room.save();
      res.status(200).json(room);
    } else res.status(200).json("room is full");
  } catch (err) {
    res.status(500).json({ err: err });
  }
});


router.post("/room", async (req, res) => {
  try {
    const newroom = new Room({
      roomName: req.body.roomName,
    });

    const room = await newroom.save();
    res.status(200).json(room);
  } catch (err) {
    res.status(500).json({ err: err });
  }
});



module.exports = router;
