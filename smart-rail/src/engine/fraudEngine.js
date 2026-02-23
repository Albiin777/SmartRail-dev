// ─── Fraud Detection Engine ──────────────────────────

const blacklist = [
    { name: "Rajesh Pandey", reason: "Repeated ticketless travel" },
    { name: "Sunil Yadav", reason: "Forged ticket detected" },
];

export function checkDuplicateQR(qrData, scannedList) {
    if (scannedList.includes(qrData)) {
        return { type: "DUPLICATE_QR", severity: "critical", message: "⚠️ Duplicate QR — This ticket has already been scanned" };
    }
    return null;
}

export function checkTicketUsed(passenger) {
    if (passenger.verified) {
        return { type: "TICKET_USED", severity: "critical", message: "🚫 Ticket already verified — possible re-use attempt" };
    }
    return null;
}

export function checkExpiredJourney(passenger, currentStation, stations) {
    const destIndex = stations.indexOf(passenger.destination);
    const currIndex = stations.indexOf(currentStation);
    if (destIndex !== -1 && currIndex !== -1 && currIndex > destIndex) {
        return { type: "EXPIRED_JOURNEY", severity: "warning", message: `⏰ Journey expired — destination ${passenger.destination} already passed` };
    }
    return null;
}

export function checkWrongDate(passenger, today) {
    if (passenger.ticketDate && passenger.ticketDate !== today) {
        return { type: "WRONG_DATE", severity: "critical", message: `📅 Wrong date — ticket is for ${passenger.ticketDate}, today is ${today}` };
    }
    return null;
}

export function checkBlacklisted(passenger) {
    const match = blacklist.find(b => b.name.toLowerCase() === passenger.name.toLowerCase());
    if (match) {
        return { type: "BLACKLISTED", severity: "critical", message: `🚨 Blacklisted passenger — ${match.reason}` };
    }
    return null;
}

export function checkCoachMismatch(passenger, currentCoach) {
    if (passenger.coach && passenger.coach !== currentCoach) {
        return { type: "COACH_MISMATCH", severity: "warning", message: `🔀 Coach mismatch — ticket is for ${passenger.coach}, currently in ${currentCoach}` };
    }
    return null;
}

export function runAllChecks(passenger, { scannedQRs, currentStation, stations, today, currentCoach, qrData }) {
    const warnings = [];
    if (qrData) {
        const dup = checkDuplicateQR(qrData, scannedQRs);
        if (dup) warnings.push(dup);
    }
    const checks = [
        checkTicketUsed(passenger),
        checkExpiredJourney(passenger, currentStation, stations),
        checkWrongDate(passenger, today),
        checkBlacklisted(passenger),
        checkCoachMismatch(passenger, currentCoach),
    ];
    checks.forEach(c => { if (c) warnings.push(c); });
    return warnings;
}
