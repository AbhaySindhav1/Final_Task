const mongoose = require("mongoose");

const FeedbackSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
    },
    FeedBack: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);
const FeedBack = mongoose.model("FeedBack", FeedbackSchema);

module.exports = FeedBack;
