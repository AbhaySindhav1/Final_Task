const express = require("express");
const router = new express.Router();
const auth = require("../Controller/middleware/auth");
const { handleUpload } = require("../Controller/middleware/multer");
const Type = require("../Model/vehicleModel");
const City = require("../Model/cityModel");
const Price = require("../Model/pricingModel");
const mongoose = require("mongoose");
const { Types } = require("mongoose");

/////////////////////////////////////////////////////////          Add Pricing         ////////////////////////////////////////////////////////////////////////////////////

router.post("/price", handleUpload, auth, async (req, res) => {
  try {
    if (
      !req.body.country ||
      req.body.country === "undefined" ||
      req.body.country === "null"
    ) {
      throw new Error("Country Is Required");
    } else if (
      !req.body.city ||
      req.body.city === "undefined" ||
      req.body.city === "null"
    ) {
      throw new Error("City Is Required");
    } else if (
      !req.body.type ||
      req.body.type === "undefined" ||
      req.body.type === "null"
    ) {
      throw new Error("Type Is Required");
    }
    const existingModel = await Price.findOne({
      country: new mongoose.Types.ObjectId(req.body.country),
      city: new mongoose.Types.ObjectId(req.body.city),
      type: new mongoose.Types.ObjectId(req.body.type),
    });

    if (existingModel) {
      return res.status(400).send({
        code: 39,
        message: "A model with these details already exists",
      });
    }

    req.body.country = new mongoose.Types.ObjectId(req.body.country);
    req.body.city = new mongoose.Types.ObjectId(req.body.city);
    req.body.type = new mongoose.Types.ObjectId(req.body.type);

    const price = new Price(req.body);
    await price.save();
    res
      .status(200)
      .json({ massage: "price for this zone is created", id: price._id });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

/////////////////////////////////////////////////////////          Edit Zone Pricing        ////////////////////////////////////////////////////////////////////////////////////

router.patch("/price/:id", auth, handleUpload, async (req, res) => {
  const fieldtoupdate = Object.keys(req.body);

  req.body.country = new mongoose.Types.ObjectId(req.body.country);
  req.body.city = new mongoose.Types.ObjectId(req.body.city);
  req.body.type = new mongoose.Types.ObjectId(req.body.type);

  try {
    const price = await Price.findById(req.params.id);
    const priceId = new mongoose.Types.ObjectId(req.params.id);

    const existingModel = await Price.findOne({
      country: req.body.country,
      city: req.body.city,
      type: req.body.type,
    });

    if (existingModel && !priceId.equals(existingModel._id)) {
      return res.status(400).send({
        code: 39,
        message: "A model with these details already exists",
      });
    }

    fieldtoupdate.forEach((field) => {
      price[field] = req.body[field];
    });

    await price.save();
    res
      .status(200)
      .json({ massage: "price for this zone is Edited", id: price._id });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

/////////////////////////////////////////////////////////          Get All Zone Vehicles        ////////////////////////////////////////////////////////////////////////////////////

router.get("/price/Vehicle", handleUpload, auth, async (req, res) => {
  const SearchQuery = req.query.Value ? req.query.Value.trim() : "";
  try {
    const prices = await Price.aggregate([
      {
        $lookup: {
          from: "zones",
          localField: "city",
          foreignField: "_id",
          as: "cityInfo",
        },
      },
      {
        $unwind: {
          path: "$cityInfo", //preserveNullAndEmptyArrays is false by default.
        },
      },
      {
        $match: {
          "cityInfo.city": { $regex: SearchQuery },
        },
      },
      {
        $lookup: {
          from: "taxis",
          localField: "type",
          foreignField: "_id",
          as: "VehicleInfo",
        },
      },
      {
        $unwind: {
          path: "$VehicleInfo", //preserveNullAndEmptyArrays is false by default.
        },
      },
      {
        $group: {
          _id: "$VehicleInfo._id",
          types: { $first: "$VehicleInfo.types" },
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          types: 1,
        },
      },
    ]);

    res.status(200).send(prices);
  } catch (error) {
    res.status(400).send(error);
  }
});

/////////////////////////////////////////////////////////          Get Zone Pricing        ////////////////////////////////////////////////////////////////////////////////////

router.post("/price/pricing", handleUpload, auth, async (req, res) => {
  console.log(req.body);
  if (!(req.body.city && req.body.type)) return;
  try {
    const prices = await Price.aggregate([
      {
        $lookup: {
          from: "zones",
          localField: "city",
          foreignField: "_id",
          as: "cityInfo",
        },
      },
      {
        $lookup: {
          from: "taxis",
          localField: "type",
          foreignField: "_id",
          as: "VehicleInfo",
        },
      },
      {
        $unwind: "$VehicleInfo",
      },
      {
        $unwind: "$cityInfo",
      },
      {
        $match: {
          "cityInfo.city": { $regex: req.body.city },
          "VehicleInfo._id": new mongoose.Types.ObjectId(req.body.type),
        },
      },
    ]);
    res.status(200).send(prices);
  } catch (error) {
    res.status(400).send(error);
  }
});

/////////////////////////////////////////////////////////          Get All Zone priceList        ////////////////////////////////////////////////////////////////////////////////////

router.post("/price/GetAllPrice", auth, async (req, res) => {
  let skip = (req.body.page - 1) * req.body.limit;
  let limit = req.body.limit;
  try {
    const priceCount = await Price.countDocuments([
      {
        $lookup: {
          from: "countries",
          localField: "country",
          foreignField: "_id",
          as: "countryInfo",
        },
      },
      {
        $lookup: {
          from: "zones",
          localField: "city",
          foreignField: "_id",
          as: "cityInfo",
        },
      },
      {
        $lookup: {
          from: "taxis",
          localField: "type",
          foreignField: "_id",
          as: "VehicleInfo",
        },
      },
    ]);

    const prices = await Price.aggregate([
      {
        $lookup: {
          from: "countries",
          localField: "country",
          foreignField: "_id",
          as: "countryInfo",
        },
      },
      {
        $lookup: {
          from: "zones",
          localField: "city",
          foreignField: "_id",
          as: "cityInfo",
        },
      },
      {
        $lookup: {
          from: "taxis",
          localField: "type",
          foreignField: "_id",
          as: "VehicleInfo",
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);
    res.status(200).send({ prices, priceCount });
  } catch (error) {
    res.status(400).send(error);
  }
});

/////////////////////////////////////////////////////////          Delete Pricing        ////////////////////////////////////////////////////////////////////////////////////

router.delete("/price/:id", auth, async (req, res) => {
  try {
    const price = await Price.findByIdAndDelete(req.params.id);
    if (!price) {
      return new Error("Zone Prices not Found");
    }
    res.status(200).send(price);
  } catch (error) {
    res.status(400).send(error);
  }
});

/////////////////////////////////////////////////////////          Delete Pricing        ////////////////////////////////////////////////////////////////////////////////////

router.post("/price/GetVehicleOfCity", handleUpload, auth, async (req, res) => {
  let matchQuery;
  try {
    if (req.body.country && req.body.city) {
      matchQuery = {
        $match: {
          $and: [
            { country: new mongoose.Types.ObjectId(req.body.country) },
            { city: new mongoose.Types.ObjectId(req.body.city) },
          ],
        },
      };
    }
    let lookup = [
      {
        $lookup: {
          from: "taxis",
          localField: "type",
          foreignField: "_id",
          as: "VehicleInfo",
        },
      },
      {
        $unwind: {
          path: "$VehicleInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    let pipeline = [];

    if (matchQuery) {
      pipeline.push(matchQuery);
    }
    if (lookup) {
      pipeline.push(...lookup);
    }

    let query = [{ $project: { VehicleInfo: 1, _id: 0 } }];
    pipeline.push(...query);

    let vehicle = await Price.aggregate(pipeline);
    res.status(200).json(vehicle);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

module.exports = router;
