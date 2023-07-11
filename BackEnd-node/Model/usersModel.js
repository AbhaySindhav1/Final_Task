const mongoose = require("mongoose");
const validator = require("validator");

const validatePhoneNumber = function (phoneNumber) {
  const regex = /^((\+[0-9]{0,5}-?)|0)?[0-9]{10}$/;
  return regex.test(phoneNumber);
};

const UsersSchema = mongoose.Schema({
  profile: {
    type: String,
    trim: true,
  },
  UserName: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  UserEmail: {
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
  UserPhone: {
    type: String,
    required: true,
    unique: true,
    validate: [validatePhoneNumber, "Please enter a valid phone number"],
  },
  UserCountry: {
    type: String,
    required: true,
  },
  StripeId: {
    type: String,
  },
  defaultPayment: {
    type: String,
  },
}, { timestamps: true });

const Users = mongoose.model("MyUser", UsersSchema);

module.exports = Users;
