const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    email: {
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
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.GenerateToken = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, "Secret_User_key");
  const decoded = await jwt.decode(token);
  const exp = new Date(decoded.exp * 1000);
  user.tokens = user.tokens.concat({ token: token });
  await user.save();
  return { token, exp };
};

UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Please Register");
  }
  if (user) {
    IsUserValid = await bcrypt.compare(password, user.password);
    if (!IsUserValid) {
      throw new Error("Unable to Login");
    }
    return user;
  }
};

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

const User = mongoose.model("user", UserSchema);

module.exports = User;
