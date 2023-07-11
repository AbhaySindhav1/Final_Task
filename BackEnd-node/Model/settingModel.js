const mongoose = require("mongoose");


const SettingSchema = mongoose.Schema({
    ReqCronTime: {
        type: Number,
        required: true,
        default:30
      },
    RideStops: {
        type: Number,
        required: true,
        default:1
      },
      smsID:{
        type:String,
        required:true
      },
      smsToken:{
        type:String,
        required:true
      },
      StripePublicKey:{
        type:String,
        required:true
      },
      StripePrivateKey:{
        type:String,
        required:true
      },
      EmailID:{
        type:String,
        required:true
      },
      EmailSecret:{
        type:String,
        required:true
      },
      EmailToken:{
        type:String,
        required:true
      },
}, { timestamps: true });

const Setting = mongoose.model("Setting", SettingSchema);

module.exports = Setting;