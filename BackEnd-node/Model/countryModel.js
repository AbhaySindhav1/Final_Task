const mongoose = require("mongoose");

const countrySchema = mongoose.Schema({
  countryname: {
    type: String,
    required: true,
    unique:true,
    trim: true,
  },
  currency:{
    type:String,
    trim:true
  },
  timeZone:{
    type:String,
    trim:true
  },
  countrycode:{
    type:String,
    trim:true
  }
  ,
  flagimage:{
    type:String,
    trim:true
  }
}, { timestamps: true });
const Country = mongoose.model("Country", countrySchema);


module.exports = Country;
