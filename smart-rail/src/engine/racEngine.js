export function allocateRAC(passengers, coach) {
    const racPassenger = passengers.find(
        p => p.status === "RAC" && p.coach === coach
    );

    const emptySeat = Array.from({ length: 40 }, (_, i) => i + 1)
        .find(seat =>
            !passengers.some(p => p.seat === seat && p.coach === coach)
        );

    if (racPassenger && emptySeat) {
        racPassenger.seat = emptySeat;
        racPassenger.status = "CNF";
    }

    return [...passengers];
}
