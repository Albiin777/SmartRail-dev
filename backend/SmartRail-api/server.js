const express = require('express');
const cors = require('cors');
const { dataStore } = require('./data/dataLoader');
const bookingRoutes = require('./routes/bookings');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Helper Functions ---

const generateSeats = (coach) => {
    if (!coach.classCode || !dataStore.coachTemplates[coach.classCode]) return [];

    const template = dataStore.coachTemplates[coach.classCode];
    if (!template.layout || !template.layout.pattern) return [];

    const seats = [];
    let seatNumber = 1;
    const pattern = template.layout.pattern;

    while (seatNumber <= coach.totalSeats) {
        const patternIndex = (seatNumber - 1) % pattern.length;
        const berthType = pattern[patternIndex];

        seats.push({
            seatNumber: seatNumber,
            berthType: berthType,
            isBooked: false,
            isLadiesQuota: seatNumber <= (template.ladiesQuotaSeats || 0),
            isDivyang: seatNumber <= (template.divyangSeats || 0)
        });
        seatNumber++;
    }
    return seats;
};

// --- API Endpoints ---

// 1. Search Train by Number or Name
app.get('/api/trains/search', (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Query parameter 'q' is required" });

    const lowerQuery = query.toLowerCase();
    const results = dataStore.trains.filter(train =>
        train.trainNumber.toLowerCase().includes(lowerQuery) ||
        train.trainName.toLowerCase().includes(lowerQuery)
    );

    res.json(results.map(t => ({
        trainNumber: t.trainNumber,
        trainName: t.trainName,
        source: t.source,
        destination: t.destination,
        runningDays: t.runningDays
    })));
});

// 2. Search Trains between Stations
app.get('/api/trains/between-stations', (req, res) => {
    const { source, destination } = req.query;
    if (!source || !destination) return res.status(400).json({ error: "Require source and destination" });

    const matchStation = (s, codeOrName) => {
        const query = codeOrName.toLowerCase();
        if (query.length <= 4) {
            return s.stationCode.toLowerCase() === query; // Exact Code Match for short queries like 'ERS'
        }
        return s.stationCode.toLowerCase() === query || s.stationName.toLowerCase().includes(query);
    };

    const results = dataStore.trains.filter(train => {
        if (!train.schedule) return false;
        const sourceIndex = train.schedule.findIndex(s => matchStation(s, source));
        const destIndex = train.schedule.findIndex(s => matchStation(s, destination));
        return sourceIndex !== -1 && destIndex !== -1 && sourceIndex < destIndex;
    });

    res.json(results.map(t => {
        const sourceStation = t.schedule.find(s => matchStation(s, source));
        const destStation = t.schedule.find(s => matchStation(s, destination));
        return {
            trainNumber: t.trainNumber,
            trainName: t.trainName,
            trainSource: t.source,
            trainDestination: t.destination,
            fromStation: sourceStation,
            toStation: destStation,
            runningDays: t.runningDays
        };
    }));
});

// 3. Get Full Train Details
app.get('/api/trains/:trainNumber', (req, res) => {
    const train = dataStore.trains.find(t => t.trainNumber === req.params.trainNumber);
    if (!train) return res.status(404).json({ error: "Train not found" });
    res.json(train);
});

// 4. Get Train Schedule
app.get('/api/trains/:trainNumber/schedule', (req, res) => {
    const train = dataStore.trains.find(t => t.trainNumber === req.params.trainNumber);
    if (!train) return res.status(404).json({ error: "Train not found" });
    res.json(train.schedule);
});

// 5. Get Seat Layout (Enhanced)
app.get('/api/trains/:trainNumber/seat-layout', (req, res) => {
    const layout = dataStore.seatLayouts.find(t => t.trainNumber === req.params.trainNumber);
    if (!layout) return res.status(404).json({ error: "Layout not found" });

    // Process coaches
    const processedCoaches = layout.coaches.map(coach => {
        if ((!coach.seats || coach.seats.length === 0) && coach.totalSeats > 0) {
            return {
                ...coach,
                seats: generateSeats(coach)
            };
        }
        return coach;
    });

    res.json({ ...layout, coaches: processedCoaches });
});

// 7. Search Stations
app.get('/api/stations/search', (req, res) => {
    const query = req.query.q;
    if (!query || query.length < 2) return res.status(400).json({ error: "Query min 2 chars" });

    const lowerQuery = query.toLowerCase();
    const results = [];
    for (const station of dataStore.stationsMap.values()) {
        if (station.code.toLowerCase().includes(lowerQuery) || (station.name && station.name.toLowerCase().includes(lowerQuery))) {
            results.push(station);
            if (results.length >= 20) break;
        }
    }
    res.json(results);
});

// 8. Get Station Details
app.get('/api/stations/:stationCode', (req, res) => {
    const station = dataStore.stationsMap.get(req.params.stationCode.toUpperCase());
    if (!station) return res.status(404).json({ error: "Station not found" });
    res.json(station);
});

// 9. Get Fare Details (Distance & Train-Type based)
app.get('/api/trains/:trainNumber/fare', (req, res) => {
    const { trainNumber } = req.params;
    const { source, destination } = req.query;

    const train = dataStore.trains.find(t => t.trainNumber === trainNumber);
    if (!train) return res.status(404).json({ error: "Train not found" });

    // 1. Kerala Distance Matrix (km) for accurate exact routing
    const distMatrix = {
        'TVC': { 'TVC': 0, 'QLN': 75, 'KOLL': 85, 'TRVL': 140, 'KTYM': 140, 'ERS': 220, 'SRR': 310, 'CLT': 550, 'MAQ': 650 },
        'QLN': { 'TVC': 75, 'QLN': 0, 'KOLL': 10, 'TRVL': 65, 'KTYM': 65, 'ERS': 145, 'SRR': 235, 'CLT': 475, 'MAQ': 575 },
        'KOLL': { 'TVC': 85, 'QLN': 10, 'KOLL': 0, 'TRVL': 55, 'KTYM': 55, 'ERS': 135, 'SRR': 225, 'CLT': 465, 'MAQ': 565 },
        'TRVL': { 'TVC': 140, 'QLN': 65, 'KOLL': 55, 'TRVL': 0, 'KTYM': 30, 'ERS': 85, 'SRR': 175, 'CLT': 415, 'MAQ': 515 },
        'KTYM': { 'TVC': 140, 'QLN': 65, 'KOLL': 55, 'TRVL': 30, 'KTYM': 0, 'ERS': 55, 'SRR': 145, 'CLT': 385, 'MAQ': 485 },
        'ERS': { 'TVC': 220, 'QLN': 145, 'KOLL': 135, 'TRVL': 85, 'KTYM': 55, 'ERS': 0, 'SRR': 90, 'CLT': 330, 'MAQ': 430 },
        'SRR': { 'TVC': 310, 'QLN': 235, 'KOLL': 225, 'TRVL': 175, 'KTYM': 145, 'ERS': 90, 'SRR': 0, 'CLT': 240, 'MAQ': 340 },
        'CLT': { 'TVC': 550, 'QLN': 475, 'KOLL': 465, 'TRVL': 415, 'KTYM': 385, 'ERS': 330, 'SRR': 240, 'CLT': 0, 'MAQ': 100 },
        'MAQ': { 'TVC': 650, 'QLN': 575, 'KOLL': 565, 'TRVL': 515, 'KTYM': 485, 'ERS': 430, 'SRR': 340, 'CLT': 100, 'MAQ': 0 }
    };

    let distanceKm = train.distanceKm || 0;

    if (source && destination) {
        const src = source.toUpperCase();
        const dst = destination.toUpperCase();
        if (distMatrix[src] && distMatrix[src][dst] !== undefined) {
            distanceKm = distMatrix[src][dst];
        } else if (train.schedule) {
            const fromStop = train.schedule.find(s => s.stationCode.toUpperCase() === src);
            const toStop = train.schedule.find(s => s.stationCode.toUpperCase() === dst);
            if (fromStop && toStop) {
                distanceKm = Math.abs((toStop.distanceFromSourceKm || 0) - (fromStop.distanceFromSourceKm || 0));
            }
        }
    }

    // Identify Train Type (based on name or number) for targeted rates
    let tType = 'Express'; // Default
    const tName = (train.trainName || '').toLowerCase();
    const tNum = String(train.trainNumber);
    if (tName.includes('vande bharat')) tType = 'Vande Bharat';
    else if (tName.includes('jan shatabdi')) tType = 'Jan Shatabdi';
    else if (tName.includes('superfast') || tName.includes('sf ') || (tNum.length === 5 && tNum.startsWith('12'))) tType = 'Superfast';
    else if (tName.includes('memu') || tName.includes('local') || tNum.startsWith('66')) tType = 'MEMU';
    else if (tName.includes('passenger') || tNum.startsWith('56')) tType = 'Passenger';
    else if (tName.includes('mail')) tType = 'Mail';

    // 2. Train Type Specific Rates & Min Fares (Rate/km, fixed fee, min fare)
    const specificRates = {
        'MEMU': { 'UR': { rate: 0.30, fee: 0, min: 25 }, 'GS': { rate: 0.30, fee: 0, min: 25 } },
        'Passenger': { 'UR': { rate: 0.35, fee: 0, min: 30 }, 'GS': { rate: 0.35, fee: 0, min: 30 } },
        'Express': { 'SL': { rate: 0.60, fee: 20, min: 71 }, '3A': { rate: 2.20, fee: 40, min: 295 }, '2A': { rate: 3.20, fee: 40, min: 425 } },
        'Mail': { 'SL': { rate: 0.60, fee: 20, min: 71 }, '3A': { rate: 2.20, fee: 40, min: 295 }, '2A': { rate: 3.20, fee: 40, min: 425 } },
        'Superfast': { 'SL': { rate: 0.70, fee: 20, min: 80 }, '3A': { rate: 2.50, fee: 60, min: 283 }, '2A': { rate: 3.60, fee: 60, min: 500 }, 'CC': { rate: 1.75, fee: 60, min: 200 } },
        'Jan Shatabdi': { '2S': { rate: 0.65, fee: 15, min: 75 }, 'CC': { rate: 1.75, fee: 50, min: 199 }, 'EC': { rate: 3.50, fee: 60, min: 400 } },
        'Vande Bharat': { 'CC': { rate: 3.00, fee: 80, min: 350 }, 'EC': { rate: 4.50, fee: 80, min: 700 }, '3A': { rate: 2.40, fee: 80, min: 300 } }
    };

    // 3. Fallback Rates for undefined classes
    const fallbackRates = {
        'SL': { rate: 0.60, min: 125, fee: 40 },
        '3A': { rate: 1.40, min: 295, fee: 40 },
        '3E': { rate: 1.25, min: 275, fee: 40 },
        '2A': { rate: 2.10, min: 425, fee: 40 },
        '1A': { rate: 3.50, min: 750, fee: 40 },
        'CC': { rate: 1.10, min: 195, fee: 40 },
        'EC': { rate: 2.50, min: 500, fee: 40 },
        '2S': { rate: 0.30, min: 40, fee: 15 },
        'GS': { rate: 0.20, min: 25, fee: 0 },
        'UR': { rate: 0.20, min: 25, fee: 0 },
    };

    const tatkalSurcharge = {
        'SL': 24, '3A': 28, '2A': 35, 'CC': 20, '2S': 10
    };

    const fares = {};
    const tatkalFares = {};
    const typeRates = specificRates[tType] || specificRates['Express'];

    // Define the valid classes that exist for each train type
    const validClassesMap = {
        'MEMU': ['UR'],
        'Passenger': ['UR'],
        'Express': ['SL', '3A', '2A', '1A', 'UR'],
        'Mail': ['SL', '3A', '2A', '1A', 'UR'],
        'Superfast': ['SL', '3A', '2A', '1A', 'CC', '2S', 'UR'],
        'Jan Shatabdi': ['2S', 'CC', 'EC'],
        'Vande Bharat': ['CC', 'EC', '3A']
    };

    const validClasses = validClassesMap[tType] || ['SL', '3A', '2A', '1A'];

    for (const cls of validClasses) {
        // Use specific rules if available, else fallback
        const rule = typeRates[cls] || fallbackRates[cls];
        if (!rule) continue;

        // Formula: Base (dist * rate) + Fixed Fee
        const raw = Math.round(distanceKm * rule.rate) + (rule.fee || 0);
        fares[cls] = Math.max(raw, rule.min || 0);

        // Tatkal Fare Calculation
        if (tatkalSurcharge[cls]) {
            tatkalFares[cls] = fares[cls] + tatkalSurcharge[cls];
        }
    }

    res.json({
        trainNumber,
        trainType: tType,
        distanceKm: Math.round(distanceKm * 100) / 100,
        fares,
        tatkalFares
    });
});

// 10. Check Availability (Real data from seat layouts)
app.get('/api/trains/:trainNumber/availability', (req, res) => {
    const layout = dataStore.seatLayouts.find(t => t.trainNumber === req.params.trainNumber);
    if (!layout) {
        return res.json({ trainNumber: req.params.trainNumber, availability: {} });
    }

    const availabilityMap = {};

    layout.coaches.forEach(coach => {
        const cls = coach.classCode;
        if (!cls) return;

        if (!availabilityMap[cls]) {
            availabilityMap[cls] = { total: 0, booked: 0, available: 0 };
        }

        // Generate seats if not present in DB to calculate properly
        let seats = coach.seats;
        if ((!seats || seats.length === 0) && coach.totalSeats > 0) {
            seats = generateSeats(coach);
        }

        if (seats && seats.length > 0) {
            const total = seats.length;
            const booked = seats.filter(s => s.isBooked).length;
            availabilityMap[cls].total += total;
            availabilityMap[cls].booked += booked;
            availabilityMap[cls].available += (total - booked);
        }
    });

    const availability = {};
    for (const [cls, stats] of Object.entries(availabilityMap)) {
        if (stats.available > 0) {
            availability[cls] = { status: "AVAILABLE", count: stats.available };
        } else {
            availability[cls] = { status: "WAITING LIST", count: Math.abs(stats.available) + 1 }; // Fake WL count if 0
        }
    }

    res.json({
        trainNumber: req.params.trainNumber,
        availability: availability
    });
});

// ** MOUNT BOOKING ROUTES **
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
    res.send('SmartRail API (v2 - PostgreSQL/Supabase) is running.');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
