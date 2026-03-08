import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const trainsDataPath = path.join(__dirname, '../../data', 'full_trains_database.json');
const seatLayoutDataPath = path.join(__dirname, '../../data', 'smartRailTrainsLayout.json');
const coachTypesPath = path.join(__dirname, '../../data', 'coachTypes.json');

const dataStore = {
    trains: [],
    seatLayouts: [],
    // Map<coachTypeId, coachTypeEntry> — e.g. "SL-72" -> { totalSeats, layout: { rowStructure } }
    coachTypesMap: new Map(),
    stationsMap: new Map()
};

const loadData = () => {
    try {
        if (fs.existsSync(trainsDataPath)) {
            const rawTrainData = fs.readFileSync(trainsDataPath, 'utf8');
            dataStore.trains = JSON.parse(rawTrainData);
            console.log(`[DataLoader] Loaded ${dataStore.trains.length} trains.`);

            dataStore.stationsMap.clear();
            dataStore.trains.forEach(train => {
                if (train.schedule) {
                    train.schedule.forEach(stop => {
                        if (stop.stationCode && !dataStore.stationsMap.has(stop.stationCode)) {
                            dataStore.stationsMap.set(stop.stationCode, {
                                code: stop.stationCode,
                                name: stop.stationName
                            });
                        }
                    });
                }
            });



            console.log(`[DataLoader] Extracted ${dataStore.stationsMap.size} unique stations.`);
        } else {
            console.warn(`[DataLoader] Warning: ${trainsDataPath} not found.`);
        }

        if (fs.existsSync(seatLayoutDataPath)) {
            const rawLayout = fs.readFileSync(seatLayoutDataPath, 'utf8');
            dataStore.seatLayouts = JSON.parse(rawLayout);
            console.log(`[DataLoader] Loaded ${dataStore.seatLayouts.length} seat layouts.`);
        }

        if (fs.existsSync(coachTypesPath)) {
            const rawTypes = fs.readFileSync(coachTypesPath, 'utf8');
            const coachTypesArray = JSON.parse(rawTypes);
            dataStore.coachTypesMap.clear();
            coachTypesArray.forEach(ct => {
                dataStore.coachTypesMap.set(ct.coachTypeId, ct);
            });
            console.log(`[DataLoader] Loaded ${dataStore.coachTypesMap.size} coach types.`);
        }

        // --- INJECT MOCK DATA FOR THE 6 SPECIFIC ADMIN TRAINS ---
        const specificTrainsData = [
            { "trainNumber": "12081", "trainName": "Jan Shatabdi Express", "source": "CAN", "destination": "TVC", "runningDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "classes": { "2S": { "total": 108, "booked": 102 }, "CC": { "total": 73, "booked": 70 } } },
            { "trainNumber": "20632", "trainName": "Vande Bharat Express", "source": "TVC", "destination": "MAQ", "runningDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "classes": { "CC": { "total": 78, "booked": 70 }, "EC": { "total": 52, "booked": 35 } } },
            { "trainNumber": "16650", "trainName": "Parasuram Express", "source": "NCJ", "destination": "MAQ", "runningDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "classes": { "GEN": { "total": 100, "booked": 95 }, "2S": { "total": 108, "booked": 100 } } },
            { "trainNumber": "16606", "trainName": "Ernad Express", "source": "TVC", "destination": "MAQ", "runningDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "classes": { "GEN": { "total": 90, "booked": 70 }, "2S": { "total": 108, "booked": 85 } } },
            { "trainNumber": "12695", "trainName": "Chennai SF Express", "source": "MAS", "destination": "TVC", "runningDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "classes": { "SL": { "total": 72, "booked": 72 }, "3AC": { "total": 64, "booked": 6 } } },
            { "trainNumber": "16791", "trainName": "Palaruvi Express", "source": "TEN", "destination": "PGT", "runningDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "classes": { "GEN": { "total": 90, "booked": 80 }, "SL": { "total": 72, "booked": 65 } } },
            { "trainNumber": "12082", "trainName": "Jan Shatabdi Express", "source": "TVC", "destination": "CAN", "runningDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "classes": { "2S": { "total": 108, "booked": 95 }, "CC": { "total": 73, "booked": 60 } } }
        ];

        specificTrainsData.forEach(newTrain => {
            // Update Trains DB if not exists
            if (!dataStore.trains.find(t => t.trainNumber === newTrain.trainNumber)) {
                dataStore.trains.push(newTrain);
            }

            // Also mock a seat layout for it to avoid rendering errors
            if (!dataStore.seatLayouts.find(t => t.trainNumber === newTrain.trainNumber)) {

                const classToCoachType = {
                    "2S": "2S-108", "CC": "CC-78", "EC": "EC-52", "GEN": "GS-120", "SL": "SL-72", "3AC": "3A-64", "2AC": "2A-48", "1AC": "1A-24"
                };

                const coaches = Object.keys(newTrain.classes).map((cls, idx) => ({
                    coachId: `${cls === 'GEN' ? 'GS' : cls}${idx + 1}`,
                    classCode: cls === 'GEN' ? 'GS' : (cls === '3AC' ? '3A' : cls),
                    coachTypeId: classToCoachType[cls] || 'SL-72'
                }));

                dataStore.seatLayouts.push({
                    trainNumber: newTrain.trainNumber,
                    trainName: newTrain.trainName,
                    coaches: coaches
                });
            }
        });

        console.log(`[DataLoader] Injected 6 specific mock trains. Total: ${dataStore.trains.length}`);

    } catch (err) {
        console.error("[DataLoader] Error loading data:", err);
    }
};

// Load immediately
loadData();

export {
    dataStore,
    loadData
};

