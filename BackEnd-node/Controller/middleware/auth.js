const jwt = require("jsonwebtoken");
const User = require("../../Model/userModel");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const DecodeUser = jwt.verify(token, "Secret_User_key");
    const user = await User.findOne({
      _id: DecodeUser._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error("Authentication Failed");
    }
    req.token = token;
    req.user = user;

    next(); 
  } catch (error) {
    console.log("error From Auth");
    res.status(400).send("Authentication Failed");
  }
};

module.exports = auth;
