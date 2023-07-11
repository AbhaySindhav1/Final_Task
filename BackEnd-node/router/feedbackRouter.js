const express = require("express");
const router = new express.Router();
const mongoose = require("mongoose");
const auth = require("../Controller/middleware/auth");
const multer = require("multer");
const upload = multer();
const Rides = require("../Model/createRideModel");
const FeedBack = require("../Model/FeedBackModel");

router.post("/FeedBack/:id", auth, upload.none(), async (req, res) => {
  try {
    console.log(req.params.id);
    console.log(req.body);
    const feedBack = new FeedBack(req.body);
    await feedBack.save();

    let Ride = await Rides.findByIdAndUpdate(
      req.params.id,
      {
        FeedBack: feedBack._id,
      },
      { new: true }
    );

    res.status(200).json({msg:"FeedBack is Submitted"});
  } catch (error) {
    if (error.errors && error.errors.email) {
      res.status(400).json("email is required");
    } else if (error.errors && error.errors.FeedBack) {
      res.status(400).json("FeedBack is required");
    }
  }
});

module.exports = router;
