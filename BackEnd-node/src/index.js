const express = require("express");
const cors = require("cors");
const app = express();
require("../Model/mongoose");
const path = require("path");
app.use(cors());
const UserRoute = require("../router/userRouter");
const vehicleRoute = require("../router/vehicleRouter");
const countryRoute = require("../router/countryRouter");
const cityRoute = require("../router/cityRouter");
const priceRoute = require("../router/pricingRouter");
const UsersRoute = require("../router/usersRouter");
const DriverRoute = require("../router/driverRouter");
const createRideRoute = require("../router/createRideRouter");
const settingRoute = require("../router/settingRouter");
const FeedBackRouter = require("../router/feedbackRouter");
const Sockets = require("../Controller/Functions/Socket");
const Crone = require("../Controller/Functions/Crone");

const bodyParser = require("body-parser");
const envPath = path.join(__dirname, "../key.env");

const port = process.env.Port || 3000;
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/uploads", express.static("uploads"));

require("dotenv").config({ path: envPath });
app.use(UserRoute);
app.use(vehicleRoute);
app.use(countryRoute);
app.use(cityRoute);
app.use(priceRoute);
app.use(UsersRoute);
app.use(DriverRoute);
app.use(createRideRoute);
app.use(settingRoute);
app.use(FeedBackRouter);

const server = app.listen(port, () => {
  console.log("Server Started" + " " + port);
});

const io = require("socket.io")(server);

Sockets(io);
Crone(io);
