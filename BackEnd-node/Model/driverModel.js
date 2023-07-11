const mongoose = require("mongoose");
const validator = require("validator");

const validatePhoneNumber = function (phoneNumber) {
  const regex = /^((\+[0-9]{0,5}-?)|0)?[0-9]{10}$/;
  return regex.test(phoneNumber);
};

const DriverSchema = mongoose.Schema({
  profile: {
    type: String,
    trim: true,
  },
  DriverName: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  DriverEmail: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    validator(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Please Enter Valid Email Address");
      }
    },
  },
  DriverPhone: {
    type: String,
    required: true,
    unique: true,
    validate: [validatePhoneNumber, "Please enter a valid phone number"],
  },
  DriverCity: {
    type: mongoose.Types.ObjectId,
    required: true,
    trim: true,
  },
  DriverCountry: {
    type: mongoose.Types.ObjectId,
    required: true,
    trim: true,
  },
  approval: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  ServiceType: {
    type: mongoose.Types.ObjectId,
    default: null,
  },
}, { timestamps: true });

const Driver = mongoose.model("Driver", DriverSchema);

module.exports = Driver;
