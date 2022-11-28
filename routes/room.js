const router = require("express").Router();
const Room = require("../models/room");

router.get("/getrooms", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get("/:room", async (req, res) => {
  try {
    const room = await Room.findById(req.params.room);
    res.status(200).json(room);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
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