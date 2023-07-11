const express = require("express");
const Country = require("../Model/countryModel");
const router = new express.Router();
const { handleUpload } = require("../Controller/middleware/multer");
const auth = require("../Controller/middleware/auth");
const mongoose = require("mongoose");
//                                                        //   Add   Country  //                                                                          //

router.post("/country", handleUpload, auth, async (req, res) => {
  try {
    const country = new Country(req.body);
    await country.save();
    res.status(200).json({
      message: "Country added",
      code: 21,
      id: country._id,
    });
  } catch (error) {
    if (error.errors && error.errors.countryname) {
      res.status(400).json("countryname is required");
    } else if (error.errors && error.errors.keyPattern.countryname) {
      res.status(400).json("countryname is Used");
    } else {
      res.status(400).json(error);
    }
  }
});

//                                                         //  Get All  Country  //                                                                          //

router.get("/Countries", auth, async (req, res) => {
  let query;
  const searchQuery = req.query.Value || "";
  if (mongoose.Types.ObjectId.isValid(searchQuery)) {
    query = { _id: searchQuery.trim() };
  } else {
    const regext = new RegExp(searchQuery.trim(), "i");
    query = { countryname: regext };
  }

  try {
    const countries = await Country.find(query);
    res.status(200).send(countries);
  } catch (error) {
    res.status(400).send(error);
  }
});

//                                                         //  Get  only  All  Country  //                                                                          //

router.get("/country", auth, async (req, res) => {
  const searchQuery = req.query.Value || "";
  const regext = new RegExp(searchQuery, "i");
  try {
    const conties = await Country.find({}).select("_id countryname");
    res.status(200).send(conties);
  } catch (error) {
    res.status(400).send(error);
  }
});

//                                                        //   Delete   Country  //                                                                          //

router.delete("/country/:id", auth, async (req, res) => {
  try {
    const country = await Country.findByIdAndDelete(req.params.id);
    if (!country) {
      return new Error("country not Found");
    }
    res.status(200).send(country);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
