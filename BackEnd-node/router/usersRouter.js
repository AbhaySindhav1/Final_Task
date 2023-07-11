const express = require("express");
const mongoose = require("mongoose");
const Users = require("../Model/usersModel");
const fs = require("fs");
const router = new express.Router();
const auth = require("../Controller/middleware/auth");
const { handleUserUpload } = require("../Controller/middleware/multer");
const { sendMail } = require("../Controller/Functions/nodeMailer");

const {
  createCustomer,
  SetUpIntant,
  retrievePaymentMethods,
  deletePaymentMethod,
  updateDefaultCard,
  getCustomer,
  deleteCustomer,
} = require("../Controller/Functions/Stripe");

//////                                                        ////         Add   User       ////                                                           ///////

router.post("/MyUser", auth, handleUserUpload, async (req, res) => {
  if (req.file) {
    req.body.profile = req.file.filename;
  } else {
    req.body.profile = "";
  }
  try {
    if (req.body.CountryCode) {
      req.body.UserPhone =
        "+" + req.body.CountryCode + "-" + req.body.UserPhone;
    } else {
      req.body.UserPhone = req.body.UserPhone;
    }
    const myUser = new Users(req.body);
    await myUser.save();

    // const StripeCustomer = await createCustomer(
    //   myUser.UserEmail,
    //   myUser.UserName
    // );

    // myUser.StripeId = StripeCustomer.id;

    // await myUser.save();

    sendMail(myUser.UserEmail, "WelCome", "You Registred Successfully");

    res.status(201).send({
      massage: "You Registred Successfully",
      code: 1,
      UserEmail: myUser.UserEmail,
      id: myUser._id,
    });
  } catch (error) {
    console.log(error);
    if (req.file) {
      const image = `uploads/Users/${req.file.filename}`;
      fs.unlink(image, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }

    if (
      error.errors &&
      error.errors.UserName &&
      error.errors.UserName.message
    ) {
      res.status(400).send("UserName's Validation Failed");
    } else if (error.errors && error.errors.UserEmail) {
      res.status(400).send("UserEmail's Validation Failed");
    } else if (error.errors && error.errors.UserPhone) {
      res.status(400).send("UserPhone's Validation Failed");
    } else if (error.keyValue && error.keyValue.UserEmail) {
      res.status(400).send("Email is already registered");
    } else if (error.keyValue && error.keyValue.UserPhone) {
      res.status(400).send("UserPhone number is already registered");
    }
  }
});

//////                                                        ////         Get   User       ////                                                           ///////

router.post("/MyUser/getUsers", auth, async (req, res) => {
  const searchQuery = req.body.searchValue || "";
  const sortColumn = req.body.sortColomn;
  const limit = req.body.limit || 10;
  const page = req.body.page || 1;

  const options = {
    sort: { [sortColumn ? sortColumn : "createdAt"]: sortColumn ? 1 : -1 },
    skip: (page - 1) * limit,
    limit: limit,
  };

  let users;
  let totalCount;
  try {
    let regext = null;
    if (searchQuery.charAt(0) === "+") {
      regext = new RegExp(`\\${searchQuery}`, "i");
    } else {
      regext = new RegExp(`${searchQuery}`, "i");
    }
    if (!mongoose.Types.ObjectId.isValid(req.query.Value)) {
      totalCount = await Users.countDocuments({
        $or: [
          { UserName: regext },
          { UserEmail: regext },
          { UserPhone: regext },
        ],
      });

      users = await Users.find(
        {
          $or: [
            { UserName: regext },
            { UserEmail: regext },
            { UserPhone: regext },
          ],
        },
        null, // Projection
        options // Use the options object for pagination
      );
    } else {
      totalCount = await Users.countDocuments({
        $or: [
          { UserName: regext },
          { UserEmail: regext },
          { UserPhone: regext },
        ],
      });

      users = await Users.find(
        {
          $or: [
            { UserName: regext },
            { UserEmail: regext },
            { UserPhone: regext },
            { _id: new mongoose.Types.ObjectId(req.query.Value) },
          ],
        },
        null, // Projection
        options // Use the options object for pagination
      );
    }
    res.status(200).send({ users, totalCount });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

//////                                                        ////        Edit   User       ////                                                           ///////

router.patch("/MyUser/:id", auth, handleUserUpload, async (req, res) => {
  let fieldtoupdate;
  if (req.file) {
    req.body.profile = req.file.filename;
    fieldtoupdate = Object.keys(req.body);
  } else {
    fieldtoupdate = Object.keys(req.body);
  }
  try {
    if (req.body.CountryCode) {
      req.body.UserPhone =
        "+" + req.body.CountryCode + "-" + req.body.UserPhone;
    } else {
      req.body.UserPhone = req.body.UserPhone;
    }
    const users = await Users.findById(req.params.id);
    const oldImg = `uploads/Users/${users.profile}`;
    fieldtoupdate.forEach((field) => {
      users[field] = req.body[field];
    });
    await users.save();
    if (req.file) {
      fs.unlink(oldImg, (err) => {
        if (err && err.code !== "ENOENT") {
          throw new Error("image not found deleted form local");
        }
      });
    }

    res.status(200).json({
      massage: "You updated Successfully",
      code: 1,
      UserEmail: users.UserEmail,
      id: users._id,
    });
  } catch (error) {
    console.log(error);
    if (req.file) {
      const image = `uploads/Users/${req.file.filename}`;
      fs.unlink(image, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
    if (
      error.errors &&
      error.errors.UserName &&
      error.errors.UserName.message
    ) {
      res.status(400).send("UserName Is Required");
    } else if (error.errors && error.errors.UserEmail) {
      res.status(400).send("UserEmail Is Required");
    } else if (error.errors && error.errors.UserPhone) {
      res.status(400).send("UserPhone Is Required");
    } else if (error.keyValue && error.keyValue.UserEmail) {
      res.status(400).send("Email is already registered");
    } else if (error.keyValue && error.keyValue.UserPhone) {
      res.status(400).send("UserPhone number is already registered");
    } else {
      res.status(400).send(error);
    }
  }
});

//////                                                        ////         Set up User  Intent      ////                                                           ///////

router.post("/StripeInt/:id", async (req, res) => {
  try {
    let user = await Users.findById(req.params.id);
    let customer;
    if (!user.StripeId) {
      customer = await createCustomer(user.UserEmail, user.UserName);
      user.StripeId = customer.id;
      await user.save();
      let intent = await SetUpIntant(customer.id);
      res.json({ client_secret: intent.client_secret });
    } else {
      let intent = await SetUpIntant(user.StripeId);
      customer = await getCustomer(user.StripeId);
      res.json({ customer, client_secret: intent.client_secret });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error : " + error.message });
  }
});

//////                                                        ////         Get User Payments Details      ////                                                           ///////

router.post("/StripeInt/payments/:id", async (req, res) => {
  try {
    let user = await Users.findById(req.params.id);
    if (!user.StripeId) {
      let customer = await createCustomer(user.UserEmail, user.UserName);
      user.StripeId = customer.id;
      await user.save();
      let payment = await retrievePaymentMethods(customer.id);
      res.json(payment);
    } else {
      let payment = await retrievePaymentMethods(user.StripeId);
      res.json(payment);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error : " + error.message });
  }
});

//////                                                        ////         Delete Payments Details      ////                                                           ///////

router.post("/StripeInt/delete/:id", handleUserUpload, async (req, res) => {
  console.log(req.params.id);
  try {
    let card = await deletePaymentMethod(req.params.id);
    if (card) {
      res.json({ card: card.id, massge: "Card Deleted Successfully !" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error : " + error.message });
  }
});

//////                                                        ////         Update Default Payments Details      ////                                                           ///////

router.post("/StripeInt/update/:id", async (req, res) => {
  try {
    let user = await Users.findById(req.params.id);
    if (!user) {
      throw new Error("User NOt Found");
    }

    let card = await updateDefaultCard(user.StripeId, req.body.id);
    user.defaultPayment = card.invoice_settings.default_payment_method;
    await user.save();
    res.status(200).send(user);
  } catch (error) {
    res.send(error);
  }
});

//////                                                        ///  /         Delete   User       ////                                                           ///////

router.delete("/MyUser/:id", auth, async (req, res) => {
  try {
    const users = await Users.findByIdAndDelete(req.params.id);
    if (!users) {
      return res.status(400).json("vehicle not Found");
    }
    const image = `uploads/Users/${users.profile}`;
    fs.unlink(image, (err) => {
      if (err) {
        return new Error("image not deleted form local", err);
      }
    });

    if (users.StripeId) {
      await deleteCustomer(users.StripeId);
      console.log("delete done");
    }
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
