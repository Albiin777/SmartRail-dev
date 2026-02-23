const mongoose = require("mongoose");

const trainSchema = new mongoose.Schema({
    trainNo: String,
    trainName: String,
    date: String,
    coaches: [String]
});

module.exports = mongoose.model("Train", trainSchema);
