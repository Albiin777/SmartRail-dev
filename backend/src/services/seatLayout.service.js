
import { dataStore } from './train.service.js';

// Classes that are non-bookable (guard van, pantry, unreserved general)
const NON_BOOKABLE = new Set(['SLR', 'PANTRY', 'GS', 'UR']);

/**
 * Generates a seat array for a coach from the new smartRailTrainsLayout.json format.
 * Resolves totalSeats and berth layout from coachTypes.json via coach.coachTypeId.
 *
 * @param {object} coach - { coachId, classCode, coachTypeId }
 * @returns {Array} seats - [{ seatNumber, berthType, isBooked }]
 */
export const generateSeats = (coach) => {
    // Non-bookable coaches produce no seats
    if (NON_BOOKABLE.has(coach.classCode)) return [];

    // Try to get type info from the new coachTypesMap first (keyed by coachTypeId)
    let coachType = coach.coachTypeId
        ? dataStore.coachTypesMap.get(coach.coachTypeId)
        : null;

    // Fallback: old style — coach has totalSeats directly (SmartRailSeatLayoutFull compat)
    if (!coachType && coach.totalSeats > 0) {
        const totalSeats = coach.totalSeats;
        const seats = [];
        for (let i = 1; i <= totalSeats; i++) {
            seats.push({ seatNumber: i, berthType: 'SEAT', isBooked: false });
        }
        return seats;
    }

    if (!coachType) return [];

    const totalSeats = coachType.totalSeats;
    const rowStructure = coachType.layout?.rowStructure;

    if (!rowStructure || rowStructure.length === 0) {
        // Fallback: just produce N unnamed seats if layout is missing
        return Array.from({ length: totalSeats }, (_, i) => ({
            seatNumber: i + 1, berthType: 'SEAT', isBooked: false
        }));
    }

    // Flatten rowStructure into berth types, skip AISLE markers
    const berthSequence = rowStructure
        .flat()
        .filter(b => b !== 'AISLE');

    const seats = [];
    for (let i = 0; i < totalSeats; i++) {
        const berthType = berthSequence[i % berthSequence.length] || 'SEAT';
        seats.push({
            seatNumber: i + 1,
            berthType,
            isBooked: false
        });
    }
    return seats;
};
