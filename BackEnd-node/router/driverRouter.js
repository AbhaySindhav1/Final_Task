const express = require("express");
const mongoose = require("mongoose");
const Driver = require("../Model/driverModel");
const fs = require("fs");
const router = new express.Router();
const auth = require("../Controller/middleware/auth");
const { handleDriversUpload } = require("../Controller/middleware/multer");

//////                                                        ////         Add   Driver       ////                                                           ///////

router.post("/Driver", auth, handleDriversUpload, async (req, res) => {
  console.log(req.body);
  if (req.file) {
    req.body.profile = req.file.filename;
  } else {
    req.body.profile = "";
  }

  req.body.approval = "Approve";
  req.body.status = "online";

  try {
    if (req.body.CountryCode) {
      req.body.DriverPhone =
        "+" + req.body.CountryCode + "-" + req.body.DriverPhone;
    } else {
      req.body.DriverPhone = req.body.DriverPhone;
    }
    if (mongoose.Types.ObjectId.isValid(req.body.DriverCountry)) {
      req.body.DriverCountry = new mongoose.Types.ObjectId(
        req.body.DriverCountry
      );
    } else {
      throw new Error("DriverCountry is Valid");
    }

    if (mongoose.Types.ObjectId.isValid(req.body.DriverCity)) {
      req.body.DriverCity = new mongoose.Types.ObjectId(req.body.DriverCity);
    } else {
      throw new Error("DriverCity is Valid");
    }

    const driver = new Driver(req.body);
    await driver.save();
    res.status(201).send({
      massage: "Driver Created",
      code: 1,
      DriverEmail: driver.DriverEmail,
      id: driver._id,
    });
  } catch (error) {
    if (req.file) {
      const image = `uploads/Drivers/${req.file.filename}`;
      fs.unlink(image, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
    if (
      error.errors &&
      error.errors.DriverName &&
      error.errors.DriverName.message
    ) {
      res.status(400).send("DriverName's Validation Failed");
    } else if (error.errors && error.errors.DriverEmail) {
      res.status(400).send("DriverEmail's Validation Failed");
    } else if (error.errors && error.errors.DriverPhone) {
      res.status(400).send("DriverPhone's Validation Failed");
    } else if (error.keyValue && error.keyValue.DriverEmail) {
      res.status(400).send("Email is already registered");
    } else if (error.keyValue && error.keyValue.DriverPhone) {
      res.status(400).send("DriverPhone number is already registered");
    } else if (error.errors && error.errors.DriverCity) {
      res.status(400).send("DriverCity's Validation Failed");
    } else {
      res.status(400).send(error);
    }
  }
});

//////                                                        ////         Get   Driver       ////                                                           ///////

router.post("/Driver/GetAllDriver", auth, async (req, res) => {
  const searchQuery = req.body.searchValue || "";
  const sortColumn = req.body.sortColumn || "DriverName";
  try {
    let matchQuery = {
      $or: [
        { DriverName: { $regex: `.*${searchQuery}.*`, $options: "i" } },
        { DriverEmail: { $regex: `.*${searchQuery}.*`, $options: "i" } },
        {
          DriverPhone: {
            $regex:
              searchQuery.charAt(0) === "+"
                ? `\\${searchQuery}`
                : `.*${searchQuery}.*`,
            $options: "i",
          },
        },
        {
          "CountryInfo.countryname": {
            $regex: `.*${searchQuery}.*`,
            $options: "i",
          },
        },
        { "CityInfo.city": { $regex: `.*${searchQuery}.*`, $options: "i" } },
        { approval: { $regex: `.*${searchQuery}.*`, $options: "i" } },
        { status: { $regex: `.*${searchQuery}.*`, $options: "i" } },
        {
          "ServiceTypeInfo.types": {
            $regex: `.*${searchQuery}.*`,
            $options: "i",
          },
        },
      ],
    };

    if (mongoose.Types.ObjectId.isValid(req.body.searchValue)) {
      matchQuery.$or.push({
        _id: new mongoose.Types.ObjectId(req.body.searchValue),
      });
    }

    const lookupStages = [
      {
        $lookup: {
          from: "countries",
          localField: "DriverCountry",
          foreignField: "_id",
          as: "CountryInfo",
        },
      },
      {
        $lookup: {
          from: "zones",
          localField: "DriverCity",
          foreignField: "_id",
          as: "CityInfo",
        },
      },
      {
        $lookup: {
          from: "taxis",
          localField: "ServiceType",  
          foreignField: "_id",
          as: "ServiceTypeInfo",
        },
      },
    ];

    // Add the lookup stages to the aggregation pipeline

    const driverCount = await Driver.countDocuments([
      ...lookupStages,
      {
        $match: matchQuery,
      },
      {
        $sort: { [sortColumn]: 1 },
      },
    ]);

    const drivers = await Driver.aggregate([
      ...lookupStages,
      {
        $match: matchQuery,
      },
      {
        $sort: { [sortColumn]: 1 },
      },
    ]);

    // Handle the drivers result
    res.status(200).send({drivers,driverCount});
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

//                                Get Specific Driver

router.post("/Driver/List", auth, handleDriversUpload, async (req, res) => {
  try {
    const Drivers = await Driver.aggregate([
      
      {
        $match: {
          $and: [
            { status: "online" },
            { approval: "Approve" },
            {
              ServiceType: mongoose.Types.ObjectId.isValid(req.body.ServiceType)
                ? new mongoose.Types.ObjectId(req.body.ServiceType)
                : null,
            },
            {
              DriverCity: mongoose.Types.ObjectId.isValid(req.body.RideCity)
                ? new mongoose.Types.ObjectId(req.body.RideCity)
                : null,
            },
          ],
        },
      },
    ]);
    res.status(200).json(Drivers);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

//////                                                        ////        Edit   Driver       ////                                                           ///////

router.patch("/Driver/:id", auth, handleDriversUpload, async (req, res) => {
  if (mongoose.Types.ObjectId.isValid(req.body.DriverCountry)) {
    req.body.DriverCountry = new mongoose.Types.ObjectId(
      req.body.DriverCountry
    );
  }
  if (mongoose.Types.ObjectId.isValid(req.body.DriverCity)) {
    req.body.DriverCity = new mongoose.Types.ObjectId(req.body.DriverCity);
  }

  if (req.body.ServiceType === "" || req.body.ServiceType === "null") {
    req.body.ServiceType = null;
  } else if (
    req.body.ServiceType &&
    req.body.ServiceType !== "" &&
    req.body.ServiceType !== "null"
  ) {
    req.body.ServiceType = new mongoose.Types.ObjectId(req.body.ServiceType);
  }

  let fieldtoupdate;
  if (req.file) {
    req.body.profile = req.file.filename;
    fieldtoupdate = Object.keys(req.body);
  } else {
    fieldtoupdate = Object.keys(req.body);
  }

  try {
    if (req.body.CountryCode && req.body.DriverPhone) {
      req.body.DriverPhone =
        "+" + req.body.CountryCode + "-" + req.body.DriverPhone;
    } else if (req.body.DriverPhone) {
      req.body.DriverPhone = req.body.DriverPhone;
    }
    const driver = await Driver.findById(req.params.id);

    const oldImg = `uploads/Drivers/${driver.profile}`;
    fieldtoupdate.forEach((field) => {
      driver[field] = req.body[field];
    });
    await driver.save();
    if (req.file && driver.profile) {
      fs.unlink(oldImg, (err) => {
        if (err && err.code !== "ENOENT") {
          throw new Error("image not found deleted form local");
        }
      });
    }
    res.status(200).json(driver);
  } catch (error) {
    if (req.file && req.file.filename) {
      const image = `uploads/Drivers/${req.file.filename}`;
      fs.unlink(image, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
    if (
      error.errors &&
      error.errors.DriverName &&
      error.errors.DriverName.message
    ) {
      res.status(400).send("DriverName Is Required");
    } else if (error.errors && error.errors.DriverEmail) {
      res.status(400).send("DriverEmail Is Required");
    } else if (error.errors && error.errors.DriverPhone) {
      res.status(400).send("DriverPhone Is Required");
    } else if (error.keyValue && error.keyValue.DriverEmail) {
      res.status(400).send("Email is already registered");
    } else if (error.keyValue && error.keyValue.DriverPhone) {
      res.status(400).send("DriverPhone number is already registered");
    } else if (error.errors && error.errors.DriverCity) {
      res.status(400).send("DriverCity Is Required");
    } else {
      res.status(400).send(error);
    }
  }
});

//////                                                        ////         Delete   Driver       ////                                                           ///////

router.delete("/Driver/:id", auth, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return res.status(400).json("driver not Found");
    }
    const image = `uploads/Drivers/${driver.profile}`;
    fs.unlink(image, (err) => {
      if (err) {
        return new Error("image not deleted form local", err);
      }
    });
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
