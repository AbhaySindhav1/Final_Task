const mongoose = require("mongoose");

const citySchema = mongoose.Schema({
  country: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  city: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  type: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  DriverProfit: {
    type: Number,
    required: true,
  },
  MinFarePrice: {
    type: Number,
    required: true,
  },
  BasePriceDistance: {
    type: String,
    required: true,
  },
  BasePrice: {
    type: Number,
    required: true,
  },
  DistancePrice: {
    type: Number,
    required: true,
  },
  TimePrice: {
    type: Number,
    required: true,
  },
  MaxSpace: {
    type: Number,
    required: true,
  },
}, { timestamps: true }
);

const Price = mongoose.model("Price", citySchema);

module.exports = Price;