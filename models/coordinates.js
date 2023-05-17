const mongoose = require("mongoose");

const CoordinateSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  phonenum: {
    type: Number,
    required: false,
  },

});

const Coordinates = mongoose.model("Coordinates", CoordinateSchema);

module.exports = { Coordinates };