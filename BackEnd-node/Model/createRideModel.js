const mongoose = require("mongoose");
const moment = require("moment");

const RideSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    UserName: {
      type: String,
      required: true,
    },
    type: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    PickupPoint: {
      type: String,
      required: true,
    },
    DropPoint: {
      type: String,
      required: true,
    },
    Stops: {
      type: String,
      required: true,
    },
    Distance: {
      type: String,
      required: true,
    },
    Time: {
      type: String,
      required: true,
    },
    ScheduleTime: {
      type: Date,
      required: true,
    },
    TripFee: {
      type: String,
      required: true,
    },
    DriverId: {
      type: mongoose.Types.ObjectId,
      default: null,
    },
    Driver: {
      type: String || null,
      default: null,
    },
    Status: {
      type: Number,
      default: 1,
    },
    RideStatus: {
      type: String,
      default: "New",
    },
    RideCity: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    RejectedRide: {
      type: Array,
      default: null,
    },
    PaymentType: {
      type: String,
      default: "Cash",
    },
    FeedBack: {
      type: mongoose.Types.ObjectId,
      default: null,
    },
    PaymentId: {
      type: String,
      default: null,
    },
    AssignTime: {
      type: Number,
      default: null,
    },
    AssigningType: {
      type: String,
      default: "Cron",
    },
  },
  { timestamps: true },
  {
    versionKey: "version", // Add a version key field
    optimisticConcurrency: true, // Enable optimistic concurrency control
  }
);
const CreateRide = mongoose.model("Ride", RideSchema);

module.exports = CreateRide;
