const express = require("express");
const fs = require("fs");
const Vehicle = require("../Model/vehicleModel");
const { handleUpload } = require("../Controller/middleware/multer");
const auth = require("../Controller/middleware/auth");

const router = new express.Router();

//                                                        //   Add   Vehicle  //                                                                          //

router.post("/vehicle", auth, handleUpload, async (req, res) => {
  if (req.file) {
    req.body.profile = req.file.filename;
  } else {
    req.body.profile = "";
  }
  try {
    const vehicle = new Vehicle(req.body);
    if (req.file) {
      vehicle.profile = req.file.filename;
    }
    await vehicle.save();
    res.status(200).json({
      message: "Vehicle added",
      code: 11,
      id: vehicle._id,
    });
  } catch (error) {
    if (req.file) {
      const image = `uploads/Vehicles/${req.file.filename}`;
      fs.unlink(image, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }

    if (error.errors && error.errors.types) {
      res.status(400).json("types is required");
    } else if (error.errors && error.errors.profile) {
      res.status(400).json("profile is required");
    } else {
      res.status(400).json(error);
    }
  }
});

//                                                        //           Get All  Vehicle  //                                                                          //

router.get("/Allvehicle", auth, async (req, res) => {
  const searchQuery = req.params.searchValue || "";

  const regext = new RegExp(searchQuery, "i");

  try {
    const vehicles = await Vehicle.find({
      $or: [
        // { name: regext }, 
        { type: regext }],
    });

    res.status(200).send(vehicles);
  } catch (error) {
    res.status(400).send(error);
  }
});

//                                                        //           Update   Vehicle  //                                                                          //

router.patch("/vehicle/:id", auth, handleUpload, async (req, res) => {
  let fieldtoupdate;
  if (req.file) {
    req.body.profile = req.file.filename;
    fieldtoupdate = Object.keys(req.body);
  } else {
    fieldtoupdate = Object.keys(req.body);
  }
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    const oldImg = `uploads/Vehicles/${vehicle.profile}`;
    fieldtoupdate.forEach((field) => {
      if (!req.body[field] && field !== "profile") {
        throw new Error(`${field} is required`);
      } else if (req.body[field]) {
        vehicle[field] = req.body[field];
      }
    });
    await vehicle.save();
    if (req.file) {
      fs.unlink(oldImg, (err) => {
        if (err && err.code !== "ENOENT") {
          throw new Error("image not found deleted form local");
        }
      });
    }
    res.status(200).json("updated");
  } catch (error) {
    if (req.file) {
      const image = `uploads/Vehicles/${req.file.filename}`;
      if (req.file.filename) {
        fs.unlink(image, (err) => {
          if (err) {
            console.error(err);
          }
        });
      }
    }
    res.status(400).json(error);
  }
});

//                                                        //    Get Types        //                                                                          //

router.get("/vehicle/types", auth, async (req, res) => {
  try {
    const Types = await Vehicle.find({}).select("_id types");
    res.status(200).send(Types);
  } catch (error) {
    res.status(400).send(error);
  }
});

//                                                        //   Delete   Vehicle  //                                                                          //

router.delete("/vehicle/:id", auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(400).json("vehicle not Found");
    }
    const image = `uploads/Vehicles/${vehicle.profile}`;
    fs.unlink(image, (err) => {
      if (err) {
        return new Error("image not deleted form local", err);
      }
    });
    res.status(200).send(vehicle);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
