const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '1-Seat-setup', 'smartRailTrainsLayout.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    let trains = JSON.parse(data);

    console.log(`Initial train count: ${trains.length}`);

    const seenTrainNumbers = new Set();
    const uniqueTrains = [];
    const removed trains = [];

    // Keep the FIRST occurrence of each trainNumber
    for (const train of trains) {
        if (!seenTrainNumbers.has(train.trainNumber)) {
            uniqueTrains.push(train);
            seenTrainNumbers.add(train.trainNumber);
        } else {
            console.log(`Removing duplicate (last) for train: ${train.trainNumber}`);
        }
    }

    console.log(`Final train count: ${uniqueTrains.length}`);

    fs.writeFileSync(filePath, JSON.stringify(uniqueTrains, null, 2), 'utf8');
    console.log('Deduplication keeping FIRST occurrences complete.');

} catch (err) {
    console.error('Error:', err);
}
