export function calculatePenalty(type) {
    switch (type) {
        case "NO_TICKET":
            return 1000;
        case "WRONG_COACH":
            return 500;
        default:
            return 300;
    }
}
