const router = require("express").Router();
const Room = require("../models/room")

router.post("/join", async (req, res) => {
    try {
        const room = await Room.findById(req.body.roomId);
        if (room.joinee.length < 3) {
            room.joinee.push(req.body.user);
            room.save();
            res.status(200).json(room);
        }
        else
            res.status(200).json("room is full");
    } catch (err) {
        res.status(500).json({"err":err})
    }
})


router.post("/:room/turnhistory", async (req, res) => {
    try {
        const room = await Room.findById(req.params.room);
        const newturnHistory = room.turnHistory;
        newturnHistory[req.body.index] = req.body.message;
        room.turnHistory = newturnHistory;
        await room.save();
        res.status(200).json(room)
    } catch (err) {
        res.status(500).json(err)
    }
})

router.get("/getroom", async (req, res) => {
    try {
        const socket_id = req.body.socket_id;
        const room = await Room.find({joinee:socket_id})
        res.status(200).json(req.room)
    } catch (err) {
        console.log(err);
        res.status(500).json(err)
    }
})


module.exports = router;