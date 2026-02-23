const mongoose = require("mongoose");

const penaltySchema = new mongoose.Schema({
    name: String,
    trainNo: String,
    coach: String,
    amount: Number,
    reason: String,
    time: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Penalty", penaltySchema);
