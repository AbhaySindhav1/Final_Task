const express = require("express");
const User = require("../Model/userModel");
const router = new express.Router();
const auth = require("../Controller/middleware/auth");

router.post("/User", async (req, res) => {
  console.log(req.body);
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.GenerateToken();
    res.status(201).send({
      massage: "Sing Up",
      code: 1,
      token: token.token,
      expirationDate: token.exp,
      email: user.email,
      id: user._id,
    });
  } catch (error) {
    console.log(error);
    if (error.keyPattern.email) {
      res.status(400).send("Email Already Exists");
    }
  }
});

router.post("/UserLogin", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const usertoken = await user.GenerateToken();
    res.status(200).send({
      massage: "log in",
      code: 2,
      expirationDate: usertoken.exp,
      token: usertoken.token,
      email: user.email,
      id: user._id,
    });
  } catch (error) {
    res.status(400).send("unable to login");
  }
});

router.get("/Logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.status(200).json({ data: "logout Success" });
  } catch (e) {
    res.status(500).send("token required");
  }
});

router.post("/LogoutAll", auth, async (req, res) => {
  // console.log(req.user._id);

  try {
    if (!req.user) {
      return res.status(200).json("no user found");
    }
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send("Logout From All Device Successfully");
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
