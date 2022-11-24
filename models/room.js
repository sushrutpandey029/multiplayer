const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    roomName: {
      type: String,
      required: true,
    },
    joinee: {
      type: Array,
      default:[],
    },
    restricted_user: {
        type: Array,
        default: [],
    },
    description: {
      type: String,
      default: "",
    },
    turnHistory: {
      type: Array,
      default: [],
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Room", RoomSchema);
