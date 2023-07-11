const mongoose = require("mongoose");

const citySchema = mongoose.Schema({
  country: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  city: {
    type: String,
    // type: mongoose.Types.ObjectId,
    required: true,
    unique: true,
  },
  zone: {
    type: Array,
    required: true,
  },
  Location: {
    type: Object,
    required: true,
  },
},
{ timestamps: true },);
const City = mongoose.model("Zone", citySchema);

module.exports = City;

citySchema.index({ Location: "2dsphere" });
