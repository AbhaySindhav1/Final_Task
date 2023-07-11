const express = require("express");
const router = new express.Router();
const auth = require("../Controller/middleware/auth");
const Setting = require("../Model/settingModel");
const multer = require("multer");
const upload = multer();
const { updateStripePrivateKey } = require("../Controller/Functions/Stripe");
const Socket = require("../Controller/Functions/Socket");
const { updateNodemailer } = require("../Controller/Functions/nodeMailer");
const { UpdateValueTwilio } = require("../Controller/Functions/functions");

router.patch("/Setting", auth, upload.none(), async (req, res) => {
  const fieldtoupdate = Object.keys(req.body);

  let newSetting;
  try {
    let setting = await Setting.findById(req.body.id);
    newSetting = { ...setting._doc };

    fieldtoupdate.forEach((field) => {
      setting[field] = req.body[field];
    });

    await setting.save();

    if (
      newSetting.EmailSecret !== setting.EmailSecret ||
      newSetting.EmailToken !== setting.EmailToken ||
      newSetting.EmailID !== setting.EmailID
    ) {
      await updateNodemailer(); // to update CronCycle
    }
    if (newSetting.StripePrivateKey !== setting.StripePrivateKey) {
      await updateStripePrivateKey(); // to update Stripe
    }
    if (newSetting.ReqCronTime != setting.ReqCronTime) {
      await Socket.updategetTime(); // to update CronCycle
    }
    if (
      newSetting.smsToken !== setting.smsToken ||
      newSetting.smsID !== setting.smsID
    ) {
      await UpdateValueTwilio(setting.smsID, setting.smsToken); // to update CronCycle
    }
    res.status(200).json(setting);
  } catch (error) {
    console.log("error", error);
  }
});

router.get("/Setting", auth, async (req, res) => {
  try {
    let setting = await Setting.find({});

    if (!setting) throw new Error("No settings Found");

    res.status(200).json(setting);
  } catch (error) {
    res.status(400).json("Server Error");
  }
});

module.exports = router;
