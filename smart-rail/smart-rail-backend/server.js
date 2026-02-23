const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

app.use("/api/trains", require("./routes/trainRoutes"));
app.use("/api/passengers", require("./routes/passengerRoutes"));
app.use("/api/penalty", require("./routes/penaltyRoutes"));

app.listen(5000, () =>
    console.log("Server running on port 5000")
);
