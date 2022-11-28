const router = require("express").Router();
const Room = require("../models/room");

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

router.get("/:room", async (req, res) => {
    try {
      const roomId = req.params.room
    const room = await Room.find(roomId);
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

module.exports = router;
