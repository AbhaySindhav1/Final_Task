const express = require("express");
const CreateRide = require("../Model/createRideModel");
const Users = require("../Model/usersModel");
const router = new express.Router();
const multer = require("multer");
const upload = multer();
const auth = require("../Controller/middleware/auth");
const path = require("path");
const mongoose = require("mongoose");
const moment = require("moment");
const Sockets = require("../Controller/Functions/Socket");
const { sendMessages } = require("../Controller/Functions/functions");
const { sendMail, GetHtml } = require("../Controller/Functions/nodeMailer");
const envPath = path.join(__dirname, "../key.env");
const {
  createCustomer,
  GetPayment,
} = require("../Controller/Functions/Stripe");
const { log } = require("console");
require("dotenv").config({ path: envPath });

////                                                             ///  ADD Ride ///                                                                             ////

router.post("/Ride", upload.none(), auth, async (req, res) => {
  if (!req.body.Stops) {
    req.body.Stops = [];
  }
  if (req.body.type) {
    if (!mongoose.Types.ObjectId.isValid(req.body.type)) {
      throw new Error("Vehicle Not Valid");
    }
    req.body.type = new mongoose.Types.ObjectId(req.body.type);
  }
  if (req.body.RideCity) {
    if (!mongoose.Types.ObjectId.isValid(req.body.RideCity)) {
      throw new Error("Services Not Found");
    }
    req.body.RideCity = new mongoose.Types.ObjectId(req.body.RideCity);
  }
  req.body.ScheduleTime = moment(
    req.body.ScheduleTime,
    "DD/MM/YYYY, HH:mm:ss"
  ).format("YYYY-MM-DDTHH:mm:ssZZ");

  try {
    const Ride = new CreateRide(req.body);
    await Ride.save();
    res.status(201).json({
      message: "Ride added",
      code: 51,
      id: Ride._id,
    });
  } catch (error) {
    console.log(error);
    if (error.errors && error.errors.user_id) {
      res.status(400).json("user_id is required");
    } else if (error.errors && error.errors.type) {
      res.status(400).json("type is required");
    } else if (error.errors && error.errors.PickupPoint) {
      res.status(400).json("PickupPoint is required");
    } else if (error.errors && error.errors.DropPoint) {
      res.status(400).json("DropPoint is required");
    } else if (error.errors && error.errors.ScheduleTime) {
      res.status(400).json("ScheduleTime is required");
    } else if (error.errors && error.errors.TripFee) {
      res.status(400).json("TripFee is required");
    } else {
      res.status(400).json(error);
    }
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                       //     Get Specific Rides       //                                                                     //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post("/GetRides", upload.none(), auth, async (req, res) => {
  let matchQuery;
  let filterMatchQuery;

  const limit = req.body.limit || 10;
  const page = req.body.page || 1;
  const skip = (page - 1) * limit;

  if (req.body.status && Array.isArray(req.body.status)) {
    matchQuery = {
      $match: {
        Status: { $in: req.body.status },
      },
    };
  }

  let lookup = await getlookup();

  if (req.body.filter) {
    let { Search, Status, Type, FromDate, toDate } = req.body.filter;
    filterMatchQuery = await FilterQuery(
      Search,
      Status,
      Type,
      FromDate,
      toDate
    );
  }

  let count = { $group: { _id: null, total: { $sum: 1 } } };
  let countPipeline = [
    ...(matchQuery ? [matchQuery] : []),
    ...lookup,
    ...(filterMatchQuery ? [{ $match: filterMatchQuery }] : []),
    count,
  ];

  let pipeline = [
    ...(matchQuery ? [matchQuery] : []),
    ...lookup,
    ...(filterMatchQuery ? [{ $match: filterMatchQuery }] : []),
    { $skip: skip },
    { $limit: limit },
  ];

  try {
    const Rides = await CreateRide.aggregate(pipeline);
    let totalRide = await CreateRide.aggregate(countPipeline);

    if (!totalRide[0]) {
      totalRide = 0;
    } else {
      totalRide = totalRide[0].total;
    }
    res.status(200).send({ Rides, totalRide });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                               //     History       //                                                                       //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post("/History", upload.none(), auth, async (req, res) => {
  let { Search, Status, Type, FromDate, toDate } = req.body.filter;
  let matchQuery = {
    $match: {
      Status: { $in: req.body.status },
    },
  };
  let filterMatchQuery = await FilterQuery(
    Search,
    Status,
    Type,
    FromDate,
    toDate
  );

  let lookup = await getlookup();

  let pipeline = [
    ...(matchQuery ? [matchQuery] : []),
    ...lookup,
    ...(filterMatchQuery ? [{ $match: filterMatchQuery }] : []),
  ];

  try {
    const Rides = await CreateRide.aggregate(pipeline);
    res.status(200).json(Rides);
  } catch (error) {}
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                               //     Edit  Ride       //                                                                       //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.patch("/RideStatus/:id", upload.none(), auth, async (req, res) => {
  console.log(req.body);
  if (!req.body.Status) return;
  try {
    let ride = await CreateRide.findById(req.params.id);
    if (req.body.Status != 5) {
      await Sockets.StatusChange(req.params.id, req.body.Status);
      if (req.body.Status == 2) {
        sendMessages("Ride Accepted By Driver");
      }
      if (req.body.Status == 4) {
        sendMessages("Ride Started By Driver");
      }
      res.status(200).json("Ride Status Updated");
    } else {
      if (!ride) return;
      if (!ride.PaymentType) {
        ride.PaymentType = "Cash";
        await ride.save();
      }
      if (ride && ride.PaymentType && ride.PaymentType === "Cash") {
        await Sockets.StatusChange(req.params.id, req.body.Status);
        if (req.body.Status == 5) {
          let html = await GetHtml(ride);
          await sendMail("abhayabhay202.ar@gmail.com", "invoice", null, html);
          sendMessages("Ride Completed By Driver And Paid by Cash");
        }
        res.status(200).json("Ride Completed");
        return;
      }
      if (
        ride &&
        ride.PaymentType &&
        ride.PaymentType !== "Cash" &&
        !ride.PaymentId
      ) {
        throw new Error("No Card Found Please Add Card");
      }
      if (ride && ride.PaymentType && ride.PaymentType !== "Cash") {
        const user = await Users.findById(ride.user_id);
        if (!user.StripeId) {
          let StripeID = await createCustomer(UserEmail, UserName);
          user.StripeId = StripeID;
          await user.save();
        }
        if (ride && !ride.PaymentId) {
          throw new Error("No Card Found Please Add Card");
        }
        await GetPayment(user.StripeId, ride.PaymentId, +ride.TripFee);
        await Sockets.StatusChange(req.params.id, req.body.Status);
        let html = await GetHtml(ride);
        await sendMail("abhayabhay202.ar@gmail.com", "invoice", null, html);
        res.status(200).json("Ride Completed and Payment Done");
      }
    }
  } catch (error) {
    console.log(error);
    res.status(200).send(error);
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                               //     Create Filter Query       //                                                                       //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function FilterQuery(Search, Status, Type, FromDate, toDate) {
  let filterConditions = [];

  console.log(FromDate, toDate);

  if (Search && Search !== null && Search !== "null") {
    if (mongoose.Types.ObjectId.isValid(Search)) {
      filterConditions.push({
        _id: new mongoose.Types.ObjectId(Search),
      });
    } else {
      filterConditions.push({
        $or: [
          { "userInfo.UserName": { $regex: Search, $options: "i" } },
          { "userInfo.UserPhone": { $regex: Search, $options: "i" } },
          { PickupPoint: { $regex: Search, $options: "i" } },
          { DropPoint: { $regex: Search, $options: "i" } },
        ],
      });
    }
  }

  if (Status && Status !== null && Status !== "null") {
    filterConditions.push({ Status: +Status });
  }

  if (FromDate !== null && FromDate !== "null" && FromDate) {
    filterConditions.push({
      ScheduleTime: {
        $gte: new Date(FromDate),
      },
    });
  }
  if (toDate !== null && toDate !== "null" && toDate) {
    filterConditions.push({
      ScheduleTime: {
        $lte: new Date(toDate),
      },
    });
  }

  if (Type && mongoose.Types.ObjectId.isValid(Type)) {
    filterConditions.push({ type: new mongoose.Types.ObjectId(Type) });
  }

  if (filterConditions.length > 0) {
    let filterMatchQuery = {
      $and: filterConditions,
    };
    return filterMatchQuery;
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                               //     Create Lookup Here       //                                                                       //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function getlookup() {
  let lookup = [
    {
      $lookup: {
        from: "myusers",
        localField: "user_id",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    {
      $unwind: {
        path: "$userInfo",
        preserveNullAndEmptyArrays: true,
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
        path: "$VehicleInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "drivers",
        localField: "DriverId",
        foreignField: "_id",
        as: "DriverInfo",
      },
    },
    {
      $unwind: {
        path: "$DriverInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];
  return lookup;
}

module.exports = router;
