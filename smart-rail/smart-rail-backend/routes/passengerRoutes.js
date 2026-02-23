const express = require("express");
const router = express.Router();
const Passenger = require("../models/Passenger");

// GET all passengers (multi-train)
router.get("/", async (req, res) => {
    const passengers = await Passenger.find();
    res.json(passengers);
});

// PNR Search
router.get("/pnr/:pnr", async (req, res) => {
    const passengers = await Passenger.find({ pnr: req.params.pnr });
    res.json(passengers);
});

// Verify
router.put("/verify/:id", async (req, res) => {
    const updated = await Passenger.findByIdAndUpdate(
        req.params.id,
        { verified: true },
        { new: true }
    );
    res.json(updated);
});

// No Show + RAC Upgrade
router.put("/noshow/:id", async (req, res) => {
    const passenger = await Passenger.findById(req.params.id);

    passenger.status = "EMPTY";
    await passenger.save();

    const racPassenger = await Passenger.findOne({
        trainNo: passenger.trainNo,
        coach: passenger.coach,
        status: "RAC"
    });

    if (racPassenger) {
        racPassenger.status = "CNF";
        racPassenger.seatNo = passenger.seatNo;
        await racPassenger.save();
    }

    res.json({ message: "Seat Released & RAC Upgraded" });
});

module.exports = router;
