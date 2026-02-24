
import { dataStore } from './train.service.js';

export const generateSeats = (coach) => {
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
