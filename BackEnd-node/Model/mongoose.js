const mongoose = require("mongoose");

mongoose.set('strictQuery', true);

mongoose.connect("mongodb://localhost:27017/Taxi_Task" , { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
    console.log("DataBase Is Connected");
}).catch((e)=>{
    console.log("Error Is occured" + e);
})