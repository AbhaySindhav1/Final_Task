const mongoose = require("mongoose");

const VehicleSchema = mongoose.Schema({
  profile: {
    type: String,
    required: true,
    trim: true,
  },
  types: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  // name: {
  //   type: String,
  //   required: true,
  //   trim: true,
  // },
}, { timestamps: true });
const Vehicle = mongoose.model("Taxi", VehicleSchema);

module.exports = Vehicle;
