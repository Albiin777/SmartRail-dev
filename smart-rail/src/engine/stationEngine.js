// ─── Station Automation Engine ──────────────────────────

export function moveToNextStation(currentIndex, stations) {
    if (currentIndex < stations.length - 1) {
        return currentIndex + 1;
    }
    return currentIndex;
}

/** Passengers scheduled to board at this station (not yet verified) */
export function getExpectedBoarding(passengers, stationName) {
    return passengers.filter(p => p.boarding === stationName && !p.verified);
}

/** Passengers who should have boarded at a past station but remain unverified */
export function getBoardingMissed(passengers, currentStation, stations) {
    const currIdx = stations.indexOf(currentStation);
    if (currIdx <= 0) return [];
    const pastStations = stations.slice(0, currIdx);
    return passengers.filter(p =>
        pastStations.includes(p.boarding) && !p.verified
    );
}

/** Passengers getting off at this station */
export function getAlightingPassengers(passengers, stationName) {
    return passengers.filter(p => p.destination === stationName);
}

/** Check if within N stations of the segment end */
export function isNearSegmentEnd(currentStation, endStation, stations, threshold = 1) {
    const currIdx = stations.indexOf(currentStation);
    const endIdx = stations.indexOf(endStation);
    if (currIdx === -1 || endIdx === -1) return false;
    return endIdx - currIdx <= threshold && endIdx - currIdx >= 0;
}

/** Generate boarding summary for a station */
export function getStationSummary(passengers, stationName, stations) {
    return {
        expectedBoarding: getExpectedBoarding(passengers, stationName),
        boardingMissed: getBoardingMissed(passengers, stationName, stations),
        alighting: getAlightingPassengers(passengers, stationName),
        expectedCount: getExpectedBoarding(passengers, stationName).length,
        missedCount: getBoardingMissed(passengers, stationName, stations).length,
        alightingCount: getAlightingPassengers(passengers, stationName).length,
    };
}
