const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema({
    trainNo: String,
    coach: String,
    classType: String,
    name: String,
    pnr: String,
    seatNo: Number,
    status: String, // CNF, RAC
    verified: Boolean
});

module.exports = mongoose.model("Passenger", passengerSchema);
