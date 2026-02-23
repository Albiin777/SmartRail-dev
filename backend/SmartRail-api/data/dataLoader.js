const fs = require('fs');
const path = require('path');

const trainsDataPath = path.join(__dirname, 'full_trains_database.json');
const seatLayoutDataPath = path.join(__dirname, 'SmartRailSeatLayoutFull.json');
const coachTemplatesPath = path.join(__dirname, 'coachTemplates.json');

const dataStore = {
    trains: [],
    seatLayouts: [],
    coachTemplates: {},
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

        if (fs.existsSync(coachTemplatesPath)) {
            const rawTemplates = fs.readFileSync(coachTemplatesPath, 'utf8');
            dataStore.coachTemplates = JSON.parse(rawTemplates);
             console.log(`[DataLoader] Loaded coach templates.`);
        }

    } catch (err) {
        console.error("[DataLoader] Error loading data:", err);
    }
};

// Load immediately
loadData();

module.exports = {
    dataStore,
    loadData
};

