
import { dataStore } from '../services/train.service.js';
import { generateSeats } from '../services/seatLayout.service.js';
import { railradarFetch } from '../services/externalApi.service.js';

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

function getCached(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL_MS) {
        cache.delete(key);
        return null;
    }
    console.log(`[CACHE HIT] ${key}`);
    return entry.data;
}

function setCache(key, data) {
    cache.set(key, { data, ts: Date.now() });
}

// Original external API endpoints
export async function getTrainDetails(req, res) {
    // ... logic (left mostly intact but prioritized to local if available)
    try {
        const { trainNumber } = req.params;
        const train = dataStore.trains.find(t => t.trainNumber === trainNumber);
        if (train) return res.json({ success: true, source: 'local', data: train });

        const cacheKey = `train:${trainNumber}`;
        const cached = getCached(cacheKey);
        if (cached) return res.json({ success: true, source: 'cache', data: cached });

        const data = await railradarFetch(`/trains/${trainNumber}`);
        setCache(cacheKey, data);
        return res.json({ success: true, source: 'api', data });
    } catch (err) {
        return res.status(502).json({ success: false, error: err.message });
    }
}

export async function getTrainSchedule(req, res) {
    try {
        const { trainNumber } = req.params;
        const train = dataStore.trains.find(t => t.trainNumber === trainNumber);
        if (train && train.schedule) return res.json({ success: true, source: 'local', data: train.schedule });

        const cacheKey = `schedule:${trainNumber}`;
        const cached = getCached(cacheKey);
        if (cached) return res.json({ success: true, source: 'cache', data: cached });

        const data = await railradarFetch(`/trains/${trainNumber}/schedule`);
        setCache(cacheKey, data);
        return res.json({ success: true, source: 'api', data });
    } catch (err) {
        return res.status(502).json({ success: false, error: err.message });
    }
}

export async function getTrainsBetween(req, res) {
    try {
        const source = req.query.source || req.query.from;
        const destination = req.query.destination || req.query.to;
        const date = req.query.date;

        if (!source || !destination) {
            return res.status(400).json({ success: false, error: 'Require source and destination' });
        }

        const matchStation = (s, codeOrName) => {
            let query = codeOrName.toLowerCase();
            const aliases = { 'tvla': 'trvl', 'thiruvalla': 'trvl', 'chengannur': 'cngr' };
            if (aliases[query]) query = aliases[query];
            if (query.length <= 4) return s.stationCode.toLowerCase() === query;
            return s.stationCode.toLowerCase() === query || s.stationName.toLowerCase().includes(query);
        };

        const results = dataStore.trains.filter(train => {
            if (!train.schedule) return false;
            const sourceIndex = train.schedule.findIndex(s => matchStation(s, source));
            const destIndex = train.schedule.findIndex(s => matchStation(s, destination));
            return sourceIndex !== -1 && destIndex !== -1 && sourceIndex < destIndex;
        });

        // 1. Local Database Results
        let mappedResults = results.map(t => {
            const sourceStation = t.schedule.find(s => matchStation(s, source));
            const destStation = t.schedule.find(s => matchStation(s, destination));
            return {
                trainNumber: t.trainNumber,
                trainName: t.trainName,
                trainSource: t.source,
                trainDestination: t.destination,
                fromStation: sourceStation,
                toStation: destStation,
                runningDays: t.runningDays || []
            };
        });

        // 2. Fetch live from RailRadar API
        const cacheKey = `trainsBetween:${source}:${destination}:${date}`;
        const cached = getCached(cacheKey);
        let apiResults = cached || [];

        if (!cached) {
            try {
                // Try to hit the RailRadar trains between stations endpoint
                // Note: The exact RapidAPI route might vary (e.g., /trainsBetweenStations or /searchTrains)
                const apiRes = await railradarFetch(`/trainsBetweenStations?fromStationCode=${source}&toStationCode=${destination}&dateOfJourney=${date}`);
                if (apiRes && apiRes.data) {
                    apiResults = Array.isArray(apiRes.data) ? apiRes.data : [];
                    setCache(cacheKey, apiResults);
                } else if (Array.isArray(apiRes)) {
                    apiResults = apiRes;
                    setCache(cacheKey, apiResults);
                }
            } catch (apiErr) {
                console.warn("[RailRadar API Error in getTrainsBetween]", apiErr.message);
            }
        }

        // 3. Merge Local + API results
        const merged = [...mappedResults];
        const existingNumbers = new Set(merged.map(t => t.trainNumber));

        for (const t of apiResults) {
            if (!existingNumbers.has(t.trainNumber)) {
                merged.push({
                    trainNumber: t.trainNumber,
                    trainName: t.trainName || 'Express',
                    trainSource: t.fromStationCode || t.source || 'Unknown',
                    trainDestination: t.toStationCode || t.destination || 'Unknown',
                    fromStation: {
                        stationCode: source,
                        departureTime: t.departureTime || "00:00"
                    },
                    toStation: {
                        stationCode: destination,
                        arrivalTime: t.arrivalTime || "00:00"
                    },
                    runningDays: t.runningDays || []
                });
                existingNumbers.add(t.trainNumber);
            }
        }

        // 4. Sort chronologically
        merged.sort((a, b) => {
            const timeA = a.fromStation?.departureTime || a.fromStation?.arrivalTime || "23:59";
            const timeB = b.fromStation?.departureTime || b.fromStation?.arrivalTime || "23:59";
            return timeA.localeCompare(timeB);
        });

        return res.json(merged);
    } catch (err) {
        return res.status(502).json({ success: false, error: err.message });
    }
}

export async function searchTrains(req, res) {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Query parameter 'q' is required" });

    // The frontend sends format like "Train Name (12345)" or just "12345"
    // Extract numbers if present to do an exact match, otherwise fallback to text match
    const match = query.match(/\((\d+)\)$/);
    const extractedNumber = match ? match[1] : query.replace(/\D/g, '');

    const lowerQuery = query.toLowerCase();

    const results = dataStore.trains.filter(train => {
        if (extractedNumber && train.trainNumber === extractedNumber) return true;
        return train.trainNumber.toLowerCase().includes(lowerQuery) ||
            train.trainName.toLowerCase().includes(lowerQuery) ||
            // Fallback if the raw query happens to be contained entirely (e.g. "Rajdhani Exp")
            query.includes(train.trainNumber) ||
            lowerQuery.includes(train.trainName.toLowerCase());
    });

    res.json(results.map(t => ({
        trainNumber: t.trainNumber,
        trainName: t.trainName,
        source: t.source,
        destination: t.destination,
        runningDays: t.runningDays
    })));
}

export async function searchStations(req, res) {
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
}

export async function getStationDetails(req, res) {
    const station = dataStore.stationsMap.get(req.params.stationCode.toUpperCase());
    if (!station) return res.status(404).json({ error: "Station not found" });
    res.json(station);
}

export async function getSeatLayout(req, res) {
    const layout = dataStore.seatLayouts.find(t => t.trainNumber === req.params.trainNumber);
    if (!layout) return res.status(404).json({ error: "Layout not found" });

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
}

export async function getAvailability(req, res) {
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
            availability[cls] = { status: "WAITING LIST", count: Math.abs(stats.available) + 1 };
        }
    }

    res.json({
        trainNumber: req.params.trainNumber,
        availability: availability
    });
}

export async function getFare(req, res) {
    const { trainNumber } = req.params;
    let distanceKm = req.query.distanceKm ? Number(req.query.distanceKm) : null;
    let source = req.query.source;
    let destination = req.query.destination;

    // Calculate distance if missing
    if (!distanceKm && source && destination) {
        const train = dataStore.trains.find(t => t.trainNumber === trainNumber);
        if (train && train.schedule) {
            const srcNode = train.schedule.find(s => s.stationCode.toLowerCase() === source.toLowerCase());
            const dstNode = train.schedule.find(s => s.stationCode.toLowerCase() === destination.toLowerCase());

            if (srcNode && dstNode && dstNode.distanceFromSourceKm >= 0 && srcNode.distanceFromSourceKm >= 0) {
                distanceKm = Math.abs(dstNode.distanceFromSourceKm - srcNode.distanceFromSourceKm);
            }
        }
    }

    // Fallback distance based on typical 800km journey if unknown
    if (!distanceKm || distanceKm <= 0) {
        distanceKm = 800;
    }

    // Base fare rates per km
    const baseRates = {
        '1A': 4.5, // 1st AC
        '2A': 2.8, // 2nd AC
        '3A': 2.0, // 3rd AC
        'CC': 1.8, // AC Chair Car
        'SL': 0.8, // Sleeper
        '2S': 0.5, // Second Sitting
        'General': 0.3
    };

    // Calculate fares
    const fares = {};

    // Get train layout to know which classes exist
    const layout = dataStore.seatLayouts.find(t => t.trainNumber === trainNumber);

    let classes = ['SL', '3A', '2A', '1A']; // Default
    if (layout) {
        const layoutClasses = [...new Set(layout.coaches.map(c => c.classCode).filter(Boolean))];
        if (layoutClasses.length > 0) classes = layoutClasses;
    }

    classes.forEach(cls => {
        const rate = baseRates[cls] || 1.0;
        let fareAmount = Math.round(distanceKm * rate);

        // Add flat base charges
        let flatCharge = 50;
        if (cls.includes('A') || cls === 'CC') flatCharge += 150; // AC charge
        if (cls === '1A') flatCharge += 100;

        // Round to nearest 5
        fareAmount = Math.max(50, Math.ceil((fareAmount + flatCharge) / 5) * 5);
        fares[cls] = fareAmount;
    });

    res.json({
        trainNumber,
        source: source || 'UNKNOWN',
        destination: destination || 'UNKNOWN',
        distanceKm,
        fares
    });
}
