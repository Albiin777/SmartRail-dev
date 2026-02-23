import { createContext, useContext, useState, useEffect } from "react";
import { stations } from "../data/stations";
import { allocateRAC } from "../engine/racEngine";
import { calculatePenalty } from "../engine/penaltyEngine";
import { generatePenaltyPDF } from "../utils/generatePenaltyPDF";
import { runAllChecks } from "../engine/fraudEngine";
import { getExpectedBoarding, getBoardingMissed, getAlightingPassengers, isNearSegmentEnd } from "../engine/stationEngine";

const SmartRailContext = createContext(null);

const today = "20 Feb 2026";

const initialPassengers = [
    { id: 1, coach: "S3", name: "Rahul Sharma", seatNo: 1, boarding: "Chennai", destination: "Delhi", status: "CNF", verified: false, idType: "Aadhaar", idNumber: "XXXX-XXXX-4521", pnrGroup: "PNR001", ticketDate: "20 Feb 2026", qrCode: "SMARTRAIL|1|Rahul Sharma|S3|1", blacklisted: false, berthType: "LB", age: 34 },
    { id: 2, coach: "S3", name: "Priya Singh", seatNo: 2, boarding: "Chennai", destination: "Delhi", status: "CNF", verified: false, idType: "PAN", idNumber: "ABCPS1234K", pnrGroup: "PNR001", ticketDate: "20 Feb 2026", qrCode: "SMARTRAIL|2|Priya Singh|S3|2", blacklisted: false, berthType: "MB", age: 30 },
    { id: 3, coach: "S3", name: "Amit Verma", seatNo: 5, boarding: "Chennai", destination: "Nagpur", status: "CNF", verified: false, idType: "Aadhaar", idNumber: "XXXX-XXXX-7832", pnrGroup: "PNR002", ticketDate: "20 Feb 2026", qrCode: "SMARTRAIL|3|Amit Verma|S3|5", blacklisted: false, berthType: "LB", age: 45 },
    { id: 4, coach: "S3", name: "Deepak Patel", seatNo: 7, boarding: "Nellore", destination: "Delhi", status: "CNF", verified: false, idType: "Voter ID", idNumber: "XYZ0234567", pnrGroup: "PNR003", ticketDate: "20 Feb 2026", qrCode: "SMARTRAIL|4|Deepak Patel|S3|7", blacklisted: false, berthType: "SL", age: 52 },
    { id: 5, coach: "S3", name: "Sunita Rao", seatNo: 9, boarding: "Chennai", destination: "Vijayawada", status: "CNF", verified: false, idType: "Passport", idNumber: "J8374652", pnrGroup: "PNR004", ticketDate: "20 Feb 2026", qrCode: "SMARTRAIL|5|Sunita Rao|S3|9", blacklisted: false, berthType: "LB", age: 62 },
    { id: 6, coach: "S3", name: "Vikram Joshi", seatNo: 12, boarding: "Chennai", destination: "Delhi", status: "CNF", verified: false, idType: "Aadhaar", idNumber: "XXXX-XXXX-9104", pnrGroup: "PNR005", ticketDate: "20 Feb 2026", qrCode: "SMARTRAIL|6|Vikram Joshi|S3|12", blacklisted: false, berthType: "UB", age: 28 },
    { id: 7, coach: "S3", name: "Meena Kumari", seatNo: 15, boarding: "Vijayawada", destination: "Delhi", status: "CNF", verified: false, idType: "PAN", idNumber: "DEFMK5678L", pnrGroup: "PNR006", ticketDate: "20 Feb 2026", qrCode: "SMARTRAIL|7|Meena Kumari|S3|15", blacklisted: false, berthType: "UB", age: 38 },
    { id: 8, coach: "S3", name: "Karan Malhotra", seatNo: 18, boarding: "Chennai", destination: "Bhopal", status: "CNF", verified: false, idType: "Aadhaar", idNumber: "XXXX-XXXX-3456", pnrGroup: "PNR002", ticketDate: "20 Feb 2026", qrCode: "SMARTRAIL|8|Karan Malhotra|S3|18", blacklisted: false, berthType: "MB", age: 40 },
    { id: 9, coach: "S3", name: "Neha Gupta", seatNo: 21, boarding: "Chennai", destination: "Delhi", status: "CNF", verified: false, idType: "Voter ID", idNumber: "ABC0987654", pnrGroup: "PNR007", ticketDate: "20 Feb 2026", qrCode: "SMARTRAIL|9|Neha Gupta|S3|21", blacklisted: false, berthType: "LB", age: 55 },
    { id: 10, coach: "S3", name: "Arun Kumar", seatNo: 25, boarding: "Nellore", destination: "Nagpur", status: "CNF", verified: false, idType: "Aadhaar", idNumber: "XXXX-XXXX-6789", pnrGroup: "PNR003", ticketDate: "20 Feb 2026", qrCode: "SMARTRAIL|10|Arun Kumar|S3|25", blacklisted: false, berthType: "UB", age: 33 },
    { id: 11, coach: "S3", name: "Pooja Reddy", seatNo: null, boarding: "Chennai", destination: "Delhi", status: "RAC", verified: false, idType: "PAN", idNumber: "GHIPR2345M", pnrGroup: "PNR008", ticketDate: "20 Feb 2026", qrCode: "SMARTRAIL|11|Pooja Reddy|S3|RAC", blacklisted: false, berthType: null, age: 29 },
    { id: 12, coach: "S3", name: "Ravi Shankar", seatNo: null, boarding: "Chennai", destination: "Nagpur", status: "RAC", verified: false, idType: "Aadhaar", idNumber: "XXXX-XXXX-1122", pnrGroup: "PNR009", ticketDate: "20 Feb 2026", qrCode: "SMARTRAIL|12|Ravi Shankar|S3|RAC", blacklisted: false, berthType: null, age: 44 },
    { id: 13, coach: "S2", name: "Suresh Iyer", seatNo: 3, boarding: "Chennai", destination: "Delhi", status: "CNF", verified: false, idType: "Passport", idNumber: "K9283746", pnrGroup: "PNR010", ticketDate: "20 Feb 2026", qrCode: "SMARTRAIL|13|Suresh Iyer|S2|3", blacklisted: false, berthType: "UB", age: 36 },
    { id: 14, coach: "S2", name: "Lakshmi Nair", seatNo: 8, boarding: "Chennai", destination: "Vijayawada", status: "CNF", verified: false, idType: "Aadhaar", idNumber: "XXXX-XXXX-5566", pnrGroup: "PNR010", ticketDate: "20 Feb 2026", qrCode: "SMARTRAIL|14|Lakshmi Nair|S2|8", blacklisted: false, berthType: "SL", age: 48 },
    { id: 15, coach: "S1", name: "Ganesh Pillai", seatNo: 4, boarding: "Chennai", destination: "Delhi", status: "CNF", verified: false, idType: "PAN", idNumber: "JKLGP7890N", pnrGroup: "PNR011", ticketDate: "20 Feb 2026", qrCode: "SMARTRAIL|15|Ganesh Pillai|S1|4", blacklisted: false, berthType: "LB", age: 67 },
];

const ttInfo = {
    ttName: "R. Kumar",
    employeeId: "TT4582",
    badgeNo: "BDG-9842",
    trainNo: "12627",
    trainName: "Tamil Nadu Express",
    coach: "S3",
    fromStation: "Chennai",
    toStation: "Vijayawada",
    date: "20 Feb 2026",
    currentStation: "Chennai",
    coaches: ["S1", "S2", "S3"],
    route: "Chennai → Delhi",
    shiftStart: "18:00",
    shiftEnd: "06:00",
    assignedSegment: "Chennai → Vijayawada",
};

const initialNotifications = [
    { id: 1, title: "Duty Assigned", message: "You are assigned to Coach S3 on Train 12627 — Chennai → Delhi", time: "18:45", type: "info", read: false },
    { id: 2, title: "Departure Alert", message: "Train 12627 departing Chennai Central at 22:00", time: "19:00", type: "alert", read: false },
    { id: 3, title: "Weather Advisory", message: "Heavy rain expected near Vijayawada. Possible 10–15 min delay", time: "19:15", type: "warning", read: false },
    { id: 4, title: "RAC Update", message: "2 RAC passengers allocated to Coach S3", time: "19:20", type: "info", read: true },
    { id: 5, title: "System Update", message: "SmartRail TT system updated to v2.1.0", time: "18:30", type: "system", read: true },
];

export function SmartRailProvider({ children }) {
    const [passengers, setPassengers] = useState(initialPassengers);
    const [stationIndex, setStationIndex] = useState(0);
    const [logs, setLogs] = useState([
        { time: "19:00", action: "System initialized", type: "system" },
        { time: "19:01", action: "TT R. Kumar logged in", type: "system" },
    ]);
    const [penalties, setPenalties] = useState([]);
    const [revenue, setRevenue] = useState(0);
    const [time, setTime] = useState(new Date());

    // Reviews & Complaints
    const [reviews, setReviews] = useState([
        { id: 1, passengerName: "Rahul Sharma", rating: 5, comment: "Very cooperative TT officer. Smooth journey!", time: "19:30", date: "20 Feb 2026" },
        { id: 2, passengerName: "Sunita Rao", rating: 4, comment: "Good service, coach was clean.", time: "19:45", date: "20 Feb 2026" },
    ]);

    const [complaints, setComplaints] = useState([
        { id: 1, passengerName: "Amit Verma", category: "Cleanliness", description: "Washroom in S3 needs cleaning", status: "Open", priority: "Medium", time: "19:20", date: "20 Feb 2026" },
        { id: 2, passengerName: "Vikram Joshi", category: "Safety", description: "Emergency window latch broken in bay 3", status: "In Progress", priority: "High", time: "19:35", date: "20 Feb 2026" },
    ]);

    const [notifications, setNotifications] = useState(initialNotifications);

    const [supportTickets, setSupportTickets] = useState([
        { id: 1, subject: "AC not working in Bay 2", description: "Passengers complaining about AC not functioning in bay 2 of S3", priority: "High", status: "Open", createdBy: "TT R. Kumar", time: "19:10", date: "20 Feb 2026" },
    ]);

    // ─── NEW STATE ──────────────────────────

    const [incidents, setIncidents] = useState([]);
    const [scannedQRs, setScannedQRs] = useState([]);
    const [seatSwaps, setSeatSwaps] = useState([]);
    const [noShows, setNoShows] = useState([]);
    const [racUpgrades, setRacUpgrades] = useState(0);
    const [handoverState, setHandoverState] = useState({
        active: false,
        locked: false,
        previousTT: null,
        newTTId: null,
        newTTName: null,
        summary: null,
        transferReason: null,
    });

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const addLog = (action, type = "info") => {
        const t = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        setLogs(prev => [{ time: t, action, type }, ...prev]);
    };

    const currentStation = stations[stationIndex];

    // ─── Passenger Actions ──────────────────────────

    const verifyPassenger = (id) => {
        setPassengers(prev =>
            prev.map(p => p.id === id ? { ...p, verified: true } : p)
        );
        const p = passengers.find(x => x.id === id);
        addLog(`Verified ${p?.name} (Seat ${p?.seatNo || "RAC"})`, "verify");
        addNotification("Passenger Verified", `${p?.name} has been verified at seat ${p?.seatNo || "RAC"}`, "info");
    };

    const markNoShow = (id) => {
        const p = passengers.find(x => x.id === id);
        setPassengers(prev => prev.filter(x => x.id !== id));
        setNoShows(prev => [...prev, { ...p, markedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }), station: currentStation }]);
        addLog(`Marked No-Show: ${p?.name}`, "warning");
        addNotification("No-Show Recorded", `${p?.name} marked as no-show`, "alert");
    };

    const issuePenalty = (passenger, type) => {
        const amount = calculatePenalty(type);
        const receiptId = "RCT-" + Date.now().toString(36).toUpperCase();
        const penalty = {
            id: Date.now(),
            receiptId,
            passengerId: passenger.id,
            passengerName: passenger.name,
            coach: passenger.coach,
            seatNo: passenger.seatNo,
            type,
            amount,
            ttId: ttInfo.employeeId,
            ttName: ttInfo.ttName,
            trainNo: ttInfo.trainNo,
            station: currentStation,
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            date: new Date().toLocaleDateString("en-IN"),
        };
        setPenalties(prev => [penalty, ...prev]);
        setRevenue(prev => prev + amount);
        addLog(`Penalty ₹${amount} issued to ${passenger.name} (${type})`, "penalty");
        addNotification("Penalty Issued", `₹${amount} penalty to ${passenger.name}`, "alert");
        return penalty;
    };

    const downloadPenaltyPDF = (passenger, amount) => {
        generatePenaltyPDF(
            { ...passenger, penaltyType: passenger.type || "Violation" },
            amount,
            { ...ttInfo, currentStation }
        );
    };

    const upgradeRAC = (passengerId) => {
        const updated = allocateRAC([...passengers], "S3");
        setPassengers(updated);
        const p = updated.find(x => x.id === passengerId);
        if (p && p.status === "CNF") {
            setRevenue(prev => prev + 800);
            setRacUpgrades(prev => prev + 1);
            addLog(`RAC Upgrade: ${p.name} → Seat ${p.seatNo} (₹800)`, "upgrade");
            addNotification("RAC Upgraded", `${p.name} upgraded to Seat ${p.seatNo}`, "info");
        }
    };

    const nextStation = () => {
        if (stationIndex < stations.length - 1) {
            const newIdx = stationIndex + 1;
            setStationIndex(newIdx);
            addLog(`Arrived at ${stations[newIdx]}`, "station");
            addNotification("Station Arrival", `Train arrived at ${stations[newIdx]}`, "info");

            // Auto-alert: near segment end
            if (isNearSegmentEnd(stations[newIdx], ttInfo.toStation, stations)) {
                addNotification("⚠️ Handover Alert", `Approaching ${ttInfo.toStation} — prepare for TT handover`, "warning");
            }

            // Auto-alert: unverified passengers
            const unverified = passengers.filter(p => !p.verified && p.boarding !== stations[newIdx]);
            if (unverified.length > 0) {
                addNotification("Unverified Warning", `${unverified.length} passengers still unverified`, "warning");
            }
        }
    };

    // ─── Review Actions ──────────────────────────

    const addReview = (passengerName, rating, comment) => {
        const review = {
            id: Date.now(),
            passengerName,
            rating,
            comment,
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            date: new Date().toLocaleDateString("en-IN"),
        };
        setReviews(prev => [review, ...prev]);
        addLog(`New review from ${passengerName} (${rating}★)`, "info");
    };

    // ─── Complaint Actions ──────────────────────────

    const addComplaint = (passengerName, category, description, priority) => {
        const complaint = {
            id: Date.now(),
            passengerName,
            category,
            description,
            priority,
            status: "Open",
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            date: new Date().toLocaleDateString("en-IN"),
        };
        setComplaints(prev => [complaint, ...prev]);
        addLog(`Complaint filed by ${passengerName}: ${category}`, "warning");
        addNotification("New Complaint", `${passengerName}: ${category}`, "warning");
    };

    const updateComplaintStatus = (id, status) => {
        setComplaints(prev =>
            prev.map(c => c.id === id ? { ...c, status } : c)
        );
        addLog(`Complaint #${id} updated to ${status}`, "info");
    };

    // ─── Notification Actions ──────────────────────────

    const addNotification = (title, message, type = "info") => {
        const n = {
            id: Date.now() + Math.random(),
            title,
            message,
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            type,
            read: false,
        };
        setNotifications(prev => [n, ...prev]);
    };

    const markNotificationRead = (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllNotificationsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    // ─── Support Actions ──────────────────────────

    const addSupportTicket = (subject, description, priority) => {
        const ticket = {
            id: Date.now(),
            subject,
            description,
            priority,
            status: "Open",
            createdBy: ttInfo.ttName,
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            date: new Date().toLocaleDateString("en-IN"),
        };
        setSupportTickets(prev => [ticket, ...prev]);
        addLog(`Support ticket: ${subject}`, "info");
        addNotification("Support Ticket Created", subject, "info");
    };

    const updateSupportTicketStatus = (id, status) => {
        setSupportTickets(prev =>
            prev.map(t => t.id === id ? { ...t, status } : t)
        );
    };

    // ─── QR Scan with Fraud Validation ──────────────────────────

    const findPassengerByQR = (qrData) => {
        try {
            const parts = qrData.split("|");
            if (parts[0] === "SMARTRAIL") {
                const id = parseInt(parts[1]);
                return passengers.find(p => p.id === id) || null;
            }
            const id = parseInt(qrData);
            if (!isNaN(id)) return passengers.find(p => p.id === id) || null;
            return null;
        } catch {
            return null;
        }
    };

    const scanQRWithValidation = (qrData) => {
        const passenger = findPassengerByQR(qrData);
        if (!passenger) return { passenger: null, warnings: [{ type: "NOT_FOUND", severity: "critical", message: "❌ No matching passenger found for this QR code" }] };

        const warnings = runAllChecks(passenger, {
            scannedQRs,
            currentStation,
            stations,
            today,
            currentCoach: ttInfo.coach,
            qrData,
        });

        // Track scanned QR
        setScannedQRs(prev => [...prev, qrData]);
        addLog(`QR scanned: ${passenger.name} ${warnings.length > 0 ? `(${warnings.length} warnings)` : "(clean)"}`, warnings.length > 0 ? "warning" : "verify");

        return { passenger, warnings };
    };

    // ─── Incident Logging ──────────────────────────

    const logIncident = (type, description, details = "") => {
        const incident = {
            id: "INC-" + Date.now().toString(36).toUpperCase(),
            type,
            description,
            details,
            station: currentStation,
            coach: ttInfo.coach,
            timestamp: new Date().toLocaleString("en-IN"),
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            reportedBy: ttInfo.ttName,
            status: "Open",
        };
        setIncidents(prev => [incident, ...prev]);
        addLog(`🚨 Incident: ${type} — ${description}`, "incident");
        addNotification("Incident Reported", `${type}: ${description}`, "warning");
        return incident;
    };

    const updateIncidentStatus = (id, status) => {
        setIncidents(prev =>
            prev.map(inc => inc.id === id ? { ...inc, status } : inc)
        );
    };

    // ─── Seat Management ──────────────────────────

    const swapSeats = (passengerId1, passengerId2) => {
        const p1 = passengers.find(p => p.id === passengerId1);
        const p2 = passengers.find(p => p.id === passengerId2);
        if (!p1 || !p2) return false;

        const swap = {
            id: Date.now(),
            from: { id: p1.id, name: p1.name, seat: p1.seatNo, berth: p1.berthType },
            to: { id: p2.id, name: p2.name, seat: p2.seatNo, berth: p2.berthType },
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            station: currentStation,
        };

        setPassengers(prev => prev.map(p => {
            if (p.id === passengerId1) return { ...p, seatNo: p2.seatNo, berthType: p2.berthType };
            if (p.id === passengerId2) return { ...p, seatNo: p1.seatNo, berthType: p1.berthType };
            return p;
        }));

        setSeatSwaps(prev => [swap, ...prev]);
        addLog(`Seat swap: ${p1.name} (#${p1.seatNo}) ↔ ${p2.name} (#${p2.seatNo})`, "info");
        return true;
    };

    const verifyPNRGroup = (pnrGroup) => {
        const groupMembers = passengers.filter(p => p.pnrGroup === pnrGroup && !p.verified);
        groupMembers.forEach(p => verifyPassenger(p.id));
        addLog(`PNR group ${pnrGroup} verified (${groupMembers.length} passengers)`, "verify");
    };

    const moveSeniorToLower = (passengerId) => {
        const senior = passengers.find(p => p.id === passengerId);
        if (!senior || senior.berthType === "LB") return false;

        // Find nearest available lower berth occupant willing to swap
        const lbPassenger = passengers.find(p =>
            p.coach === senior.coach && p.berthType === "LB" && p.id !== passengerId && (p.age || 0) < 55
        );

        if (lbPassenger) {
            swapSeats(passengerId, lbPassenger.id);
            addLog(`Senior accommodation: ${senior.name} moved to lower berth`, "info");
            addNotification("Senior Berth", `${senior.name} moved to lower berth (Seat ${lbPassenger.seatNo})`, "info");
            return true;
        }
        return false;
    };

    // ─── TT Handover ──────────────────────────

    const generateHandoverSummary = () => ({
        timestamp: new Date().toLocaleString("en-IN"),
        station: currentStation,
        ttId: ttInfo.employeeId,
        ttName: ttInfo.ttName,
        segment: ttInfo.assignedSegment,
        totalPassengers: passengers.length,
        verified: passengers.filter(p => p.verified).length,
        pendingVerification: passengers.filter(p => !p.verified).length,
        racPending: passengers.filter(p => p.status === "RAC").length,
        vacantSeats: 40 - passengers.filter(p => p.coach === "S3" && p.seatNo).length,
        penaltiesCollected: penalties.length,
        incidentsReported: incidents.length,
        revenueCollected: revenue,
        noShows: noShows.length,
        racUpgrades,
    });

    const initiateHandover = () => {
        const summary = generateHandoverSummary();
        setHandoverState({
            active: true,
            locked: true,
            previousTT: { id: ttInfo.employeeId, name: ttInfo.ttName },
            newTTId: null,
            newTTName: null,
            summary,
            transferReason: null,
        });
        addLog("Handover initiated — actions locked", "system");
        addNotification("Handover Initiated", "Current TT actions are now locked. Awaiting new TT acceptance.", "warning");
    };

    const acceptHandover = (newTTId, newTTName) => {
        setHandoverState(prev => ({
            ...prev,
            active: false,
            locked: false,
            newTTId,
            newTTName,
        }));
        addLog(`Handover accepted by ${newTTName} (${newTTId})`, "system");
        addNotification("Handover Complete", `Control transferred to ${newTTName}`, "info");
    };

    const cancelHandover = () => {
        setHandoverState({ active: false, locked: false, previousTT: null, newTTId: null, newTTName: null, summary: null, transferReason: null });
        addLog("Handover cancelled", "system");
    };

    const forceTransfer = (reason) => {
        const summary = generateHandoverSummary();
        setHandoverState({
            active: true,
            locked: true,
            previousTT: { id: ttInfo.employeeId, name: ttInfo.ttName },
            newTTId: null,
            newTTName: null,
            summary,
            transferReason: reason,
        });
        addLog(`Emergency transfer initiated: ${reason}`, "incident");
        addNotification("🚨 Emergency Transfer", reason, "warning");
    };

    // ─── Computed ──────────────────────────

    const nextStationName = stationIndex < stations.length - 1 ? stations[stationIndex + 1] : null;
    const nextStationBoarding = nextStationName
        ? passengers.filter(p => p.boarding === nextStationName).length
        : 0;

    const unreadNotifications = notifications.filter(n => !n.read).length;

    const expectedBoardingList = getExpectedBoarding(passengers, currentStation);
    const boardingMissedList = getBoardingMissed(passengers, currentStation, stations);
    const alightingList = getAlightingPassengers(passengers, currentStation);

    const coachS3Passengers = passengers.filter(p => p.coach === "S3");
    const occupiedSeats = coachS3Passengers.filter(p => p.seatNo).length;
    const vacantSeats = 40 - occupiedSeats;
    const vacantSeatsFilled = noShows.length; // seats freed = no-shows

    // PNR groups
    const pnrGroups = {};
    passengers.forEach(p => {
        if (p.pnrGroup) {
            if (!pnrGroups[p.pnrGroup]) pnrGroups[p.pnrGroup] = [];
            pnrGroups[p.pnrGroup].push(p);
        }
    });

    const nearSegmentEnd = isNearSegmentEnd(currentStation, ttInfo.toStation, stations);

    const stats = {
        totalPassengers: passengers.length,
        verified: passengers.filter(p => p.verified).length,
        unverified: passengers.filter(p => !p.verified && p.status === "CNF").length,
        rac: passengers.filter(p => p.status === "RAC").length,
        penaltiesCount: penalties.length,
        revenue,
        noShows: noShows.length,
        boardingMismatch: boardingMissedList.length,
        racUpgrades,
        vacantSeatsFilled,
        vacantSeats,
        incidents: incidents.length,
    };

    const value = {
        passengers,
        stations,
        stationIndex,
        currentStation,
        logs,
        penalties,
        revenue,
        time,
        ttInfo,
        stats,
        reviews,
        complaints,
        notifications,
        supportTickets,
        unreadNotifications,
        nextStationName,
        nextStationBoarding,
        // New state
        incidents,
        scannedQRs,
        seatSwaps,
        noShows,
        racUpgrades,
        handoverState,
        expectedBoardingList,
        boardingMissedList,
        alightingList,
        pnrGroups,
        nearSegmentEnd,
        vacantSeatsFilled,
        // Actions
        verifyPassenger,
        markNoShow,
        issuePenalty,
        downloadPenaltyPDF,
        upgradeRAC,
        nextStation,
        addReview,
        addComplaint,
        updateComplaintStatus,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        addSupportTicket,
        updateSupportTicketStatus,
        findPassengerByQR,
        scanQRWithValidation,
        logIncident,
        updateIncidentStatus,
        swapSeats,
        verifyPNRGroup,
        moveSeniorToLower,
        initiateHandover,
        acceptHandover,
        cancelHandover,
        forceTransfer,
        generateHandoverSummary,
    };

    return (
        <SmartRailContext.Provider value={value}>
            {children}
        </SmartRailContext.Provider>
    );
}

export function useSmartRail() {
    const ctx = useContext(SmartRailContext);
    if (!ctx) throw new Error("useSmartRail must be used within SmartRailProvider");
    return ctx;
}
