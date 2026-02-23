const express = require("express");
const router = express.Router();
const Penalty = require("../models/Penalty");

router.post("/", async (req, res) => {
    const penalty = await Penalty.create(req.body);
    res.json(penalty);
});

router.get("/", async (req, res) => {
    const penalties = await Penalty.find();
    res.json(penalties);
});

module.exports = router;
