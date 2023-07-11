const express = require("express");
const router = new express.Router();
const auth = require("../Controller/middleware/auth");
const { handleUpload } = require("../Controller/middleware/multer");
const City = require("../Model/cityModel");
const mongoose = require("mongoose");

/////////////////////////////////////////////////////////          Add City         ////////////////////////////////////////////////////////////////////////////////////

router.post("/city", handleUpload, auth, async (req, res) => {
  try {
    if (req.body.country === "undefined") {
      throw new Error("Country Is Required");
    } else if (req.body.city === "undefined") {
      throw new Error("City Is Required");
    } else if (req.body.zone === "undefined") {
      throw new Error("Zone Is Required");
    }

    const city = new City({
      country: new mongoose.Types.ObjectId(req.body.country),
      city: req.body.city,
      zone: JSON.parse(req.body.zone),
      Location: JSON.parse(req.body.Location),
    });
    await city.save();
    res.status(200).json({
      message: "City added",
      code: 21,
      id: city._id,
    });
  } catch (error) {
    console.log(error);
    if (error.errors && error.errors.city.kind === "required") {
      res.status(400).json("City Is Required");
    } else if (error.errors && error.errors.country.kind === "required") {
      res.status(400).json("Country Is Required");
    } else if (error.keyPattern && error.keyPattern.city) {
      res.status(400).json(error.keyValue.city + " " + "is Already Registered");
    } else if (error.errors && error.errors.zone.kind === "required") {
      res.status(400).json("Zone Is Required");
    } else if (
      error.toString().includes("MongoServerError") &&
      error.toString().includes("Loop is not valid")
    ) {
      res.status(400).json("Please Draw Valid Zone");
    } else {
      res.status(400).send(error.toString());
    }
  }
});

/////////////////////////////////////////////////////////          Get City         ////////////////////////////////////////////////////////////////////////////////////

// router.post("/Cities/GetAll", auth, async (req, res) => {
//   let skip = (req.body.page - 1) * req.body.limit;
//   let limit = req.body.limit;
//   try {
//     const ZoneCount = await City.countDocuments([
//       {
//         $lookup: {
//           from: "countries",
//           localField: "country",
//           foreignField: "_id",
//           as: "countryInfo",
//         },
//       },
//     ]);
//     const cities = await City.aggregate([
//       {
//         $lookup: {
//           from: "countries",
//           localField: "country",
//           foreignField: "_id",
//           as: "countryInfo",
//         },
//       },
//       { $skip: skip },
//       { $limit: limit },
//     ]);

//     res.status(200).send({ cities, ZoneCount });
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

router.post("/Cities/GetAll", handleUpload, auth, async (req, res) => {
  let pipeline = [];
  try {
    const { page, limit, Country } = req.body;
    console.log(Country);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const parsedLimit = parseInt(limit);

    if (Country && Country != null && Country != "null") {
        pipeline.push({
        $match: {
          country: new mongoose.Types.ObjectId(Country),
        },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: "countries",
          localField: "country",
          foreignField: "_id",
          as: "countryInfo",
        },
      },
      {
        $unwind: {
          path: "$countryInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $skip: skip },
      { $limit: parsedLimit }
    );

    let count = {
      $group: { _id: null, Zone: { $push: "$zone" }, total: { $sum: 1 } },
    };
    const countPipeline = [...pipeline];
    countPipeline.pop();
    countPipeline.pop();
    countPipeline.push(count);
    const cities = await City.aggregate(pipeline);
    const zoneCount = await City.aggregate(countPipeline);

    res.status(200).json({ cities, ZoneCount: zoneCount });
  } catch (error) {
    console.log(error);
  }
});

/////////////////////////////////////////////////////////          Get Cities using CountryId        ////////////////////////////////////////////////////////////////////////////////////

router.get("/CityCountry", auth, async (req, res) => {
  const searchQuery = req.query.Value || "";
  if (searchQuery) {
    searchQuery.trim();
  }
  try {
    const cities = await City.find({
      $or: [{ country: new mongoose.Types.ObjectId(searchQuery) }],
    }).select("_id city");

    res.status(200).send(cities);
  } catch (error) {
    res.status(400).send(error);
  }
});
/////////////////////////////////////////////////////////          Get zONES         ////////////////////////////////////////////////////////////////////////////////////

router.get("/CityCountryZone", auth, async (req, res) => {
  try {
    const Zones = await City.find({}).select("-_id zone").distinct("zone");
    res.status(200).send(Zones);
  } catch (error) {
    res.status(400).send(error);
  }
});
/////////////////////////////////////////////////////////          Get Check Zone         ////////////////////////////////////////////////////////////////////////////////////

router.get("/CityCordinates", auth, async (req, res) => {
  try {
    const Cord = await City.aggregate([
      {
        $match: {
          Location: {
            $geoIntersects: {
              $geometry: {
                type: "Point",
                coordinates: [
                  +req.query.loc.split(",")[0],
                  +req.query.loc.split(",")[1],
                ],
              },
            },
          },
        },
      },
    ]);
    res.status(200).send(Cord[0]);
  } catch (error) {
    console.log(error.error.includes("MongoServerError"));
    console.log(error.error.includes("Loop is not valid"));
    if (
      error.error.includes("MongoServerError") &&
      error.error.includes("Loop is not valid")
    ) {
      res.status(400).send("Emter Valid Zone");
    } else {
      res.status(400).send("Emter Valid Zone");
    }
  }
});

/////////////////////////////////////////////////////////          Edit  County         ////////////////////////////////////////////////////////////////////////////////////

router.patch("/city/:id", auth, handleUpload, async (req, res) => {
  if (req.body.zone) {
    req.body.zone = JSON.parse(req.body.zone);
  }
  if (req.body.Location) {
    req.body.Location = JSON.parse(req.body.Location);
  }

  const fieldtoupdate = Object.keys(req.body);
  try {
    const city = await City.findById(req.params.id);
    if (!city) {
      throw new Error("city not found");
    }
    fieldtoupdate.forEach((field) => {
      city[field] = req.body[field];
    });

    await city.save();
    res.status(200).json({
      message: "City Edited",
      code: 22,
      id: city._id,
    });
  } catch (error) {
    if (error.errors && error.errors.city.kind === "required") {
      res.status(400).json("City Is Required");
    } else if (error.errors && error.errors.country.kind === "required") {
      res.status(400).json("Country Is Required");
    } else if (error.errors && error.errors.zone.kind === "required") {
      res.status(400).json("Zone Is Required");
    } else if (
      error.toString().includes("MongoServerError") &&
      error.toString().includes("Loop is not valid")
    ) {
      res.status(400).json("Please Draw Valid Zone");
    } else {
      res.status(400).send(error.toString());
    }
  }
});

module.exports = router;
