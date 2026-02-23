import { useState } from "react";
import { useSmartRail } from "../hooks/useSmartRail";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiCheck, FiXCircle, FiCamera, FiCreditCard, FiAlertTriangle, FiX, FiUser } from "react-icons/fi";
import QRScannerModal from "../components/QRScannerModal";

export default function InspectionPage() {
    const {
        passengers, verifyPassenger, markNoShow, findPassengerByQR,
        scanQRWithValidation, expectedBoardingList, boardingMissedList, currentStation
    } = useSmartRail();
    const [selected, setSelected] = useState(null);
    const [coachFilter, setCoachFilter] = useState("S3");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [showID, setShowID] = useState(false);
    const [qrWarnings, setQrWarnings] = useState([]);

    const coachPassengers = passengers.filter(p => p.coach === coachFilter);
    const filteredPassengers = statusFilter === "ALL"
        ? coachPassengers
        : coachPassengers.filter(p => p.status === statusFilter);

    const getPassenger = (seat) => coachPassengers.find(p => p.seatNo === seat);

    const getSeatClass = (seat) => {
        const p = getPassenger(seat);
        if (!p) return "seat-empty";
        if (expectedBoardingList.some(eb => eb.id === p.id)) return "seat-rac";
        if (p.verified) return "seat-verified";
        if (p.status === "RAC") return "seat-rac";
        return "seat-unverified";
    };

    const openSeatPopup = (seat) => {
        const p = getPassenger(seat);
        if (p) {
            setSelected(p);
            setShowID(false);
            setQrWarnings([]);
        }
    };

    const handleVerify = (id) => {
        verifyPassenger(id);
        setSelected(prev => prev ? { ...prev, verified: true } : null);
        setQrWarnings([]);
    };

    const handleQRScan = (data) => {
        const result = scanQRWithValidation(data);
        if (result.passenger) {
            setSelected(result.passenger);
            setCoachFilter(result.passenger.coach);
            setShowID(false);
        }
        setQrWarnings(result.warnings);
    };

    const idTypeIcon = (type) => {
        switch (type) {
            case "Aadhaar": return "🪪";
            case "PAN": return "💳";
            case "Passport": return "📘";
            case "Voter ID": return "🗳️";
            default: return "🆔";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="page-title">Ticket Inspection</h1>
                    <p className="page-subtitle">Verify passengers and manage seat allocation</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setShowQRScanner(true)} className="btn btn-dark">
                        <FiCamera size={14} /> Scan QR
                    </button>
                    <select
                        value={coachFilter}
                        onChange={e => setCoachFilter(e.target.value)}
                        className="input-field"
                    >
                        <option value="S1">Coach S1</option>
                        <option value="S2">Coach S2</option>
                        <option value="S3">Coach S3</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="input-field"
                    >
                        <option value="ALL">All Status</option>
                        <option value="CNF">Confirmed</option>
                        <option value="RAC">RAC</option>
                    </select>
                </div>
            </div>

            {/* Station Boarding Alerts */}
            {(expectedBoardingList.length > 0 || boardingMissedList.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {expectedBoardingList.length > 0 && (
                        <div className="p-4 rounded-xl" style={{ background: "var(--accent-blue-bg)", border: "1px solid var(--accent-blue-border)" }}>
                            <h4 className="text-[12px] font-semibold mb-2" style={{ color: "var(--accent-blue)" }}>
                                📋 Expected Boarding at {currentStation} ({expectedBoardingList.length})
                            </h4>
                            <div className="space-y-1">
                                {expectedBoardingList.map(p => (
                                    <div key={p.id} className="text-[12px] flex justify-between" style={{ color: "var(--text-secondary)" }}>
                                        <span>{p.name}</span>
                                        <span>{p.coach}-{p.seatNo || "RAC"}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {boardingMissedList.length > 0 && (
                        <div className="p-4 rounded-xl" style={{ background: "var(--accent-red-bg)", border: "1px solid var(--accent-red-border)" }}>
                            <h4 className="text-[12px] font-semibold mb-2" style={{ color: "var(--accent-red)" }}>
                                ⚠️ Boarding Missed ({boardingMissedList.length})
                            </h4>
                            <div className="space-y-1">
                                {boardingMissedList.map(p => (
                                    <div key={p.id} className="text-[12px] flex justify-between" style={{ color: "var(--text-secondary)" }}>
                                        <span>{p.name} (from {p.boarding})</span>
                                        <span>{p.coach}-{p.seatNo || "RAC"}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* QR Fraud Warnings */}
            <AnimatePresence>
                {qrWarnings.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-2"
                    >
                        {qrWarnings.map((w, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-3 rounded-xl"
                                style={{
                                    background: w.severity === "critical" ? "var(--accent-red-bg)" : "var(--accent-amber-bg)",
                                    border: `1px solid ${w.severity === "critical" ? "var(--accent-red-border)" : "var(--accent-amber-border)"}`,
                                }}
                            >
                                <FiAlertTriangle size={16} style={{ color: w.severity === "critical" ? "var(--accent-red)" : "var(--accent-amber)" }} />
                                <span className="text-[13px] font-medium" style={{ color: w.severity === "critical" ? "var(--accent-red)" : "var(--accent-amber)" }}>
                                    {w.message}
                                </span>
                                <span className={`badge ${w.severity === "critical" ? "badge-danger" : "badge-warning"} ml-auto`}>
                                    {w.type.replace(/_/g, " ")}
                                </span>
                            </div>
                        ))}
                        <button onClick={() => setQrWarnings([])} className="btn btn-ghost text-[11px]">
                            Dismiss Warnings
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Seat Layout */}
                <div className="lg:col-span-2 card-static p-6">
                    <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                        Sleeper Coach {coachFilter} — Seat Layout
                        <span className="text-[11px] font-normal ml-2" style={{ color: "var(--text-muted)" }}>
                            (tap a seat to view details)
                        </span>
                    </h3>

                    <div className="space-y-5">
                        {Array.from({ length: 5 }, (_, bay) => {
                            const start = bay * 8 + 1;
                            return (
                                <div key={bay} className="flex items-start gap-6">
                                    <div className="text-[10px] font-semibold mt-3 w-8" style={{ color: "var(--text-muted)" }}>
                                        B{bay + 1}
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        {[0, 1, 2, 3, 4, 5].map(i => {
                                            const seat = start + i;
                                            const labels = ["LB", "MB", "UB", "LB", "MB", "UB"];
                                            return (
                                                <motion.div
                                                    key={seat}
                                                    whileHover={{ scale: 1.12 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => openSeatPopup(seat)}
                                                    className={`seat-cell ${getSeatClass(seat)}`}
                                                >
                                                    <div className="text-center">
                                                        <div>{seat}</div>
                                                        <div className="text-[8px] opacity-50">{labels[i]}</div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    <div className="w-px h-24 self-center" style={{ background: "var(--border-light)" }} />

                                    <div className="grid grid-rows-2 gap-2">
                                        {[6, 7].map(i => {
                                            const seat = start + i;
                                            const labels = ["SL", "SU"];
                                            return (
                                                <motion.div
                                                    key={seat}
                                                    whileHover={{ scale: 1.12 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => openSeatPopup(seat)}
                                                    className={`seat-cell ${getSeatClass(seat)}`}
                                                >
                                                    <div className="text-center">
                                                        <div>{seat}</div>
                                                        <div className="text-[8px] opacity-50">{labels[i - 6]}</div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex gap-6 mt-6 pt-4 flex-wrap text-[11px]" style={{ borderTop: "1px solid var(--border-light)", color: "var(--text-muted)" }}>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded seat-empty" /> Empty</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded seat-verified" /> Verified</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded seat-unverified" /> Unverified</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded seat-rac" /> RAC / Boarding</div>
                    </div>
                </div>

                {/* Quick Passenger List */}
                <div className="card-static p-6">
                    <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                        Passengers ({filteredPassengers.length})
                    </h3>
                    <div className="space-y-1 max-h-[500px] overflow-y-auto">
                        {filteredPassengers.map(p => (
                            <div
                                key={p.id}
                                onClick={() => { setSelected(p); setShowID(false); setQrWarnings([]); }}
                                className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all text-[13px]"
                                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-input)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                <div>
                                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</span>
                                    <span className="ml-2 text-[12px]" style={{ color: "var(--text-muted)" }}>
                                        {p.seatNo ? `#${p.seatNo}` : "RAC"}
                                    </span>
                                </div>
                                <span className={`badge ${p.verified ? "badge-success" : "badge-danger"}`}>
                                    {p.verified ? "✓" : "•"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ===================== PASSENGER DETAILS POPUP ===================== */}
            <AnimatePresence>
                {selected && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="popup-overlay"
                            onClick={() => setSelected(null)}
                        />

                        {/* Popup Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: "spring", damping: 25, stiffness: 350 }}
                            className="popup-container"
                        >
                            <div className="popup-card">
                                {/* Header */}
                                <div className="popup-header">
                                    <div className="flex items-center gap-3">
                                        <div className="popup-avatar">
                                            <FiUser size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-[16px] font-bold" style={{ color: "var(--text-primary)" }}>
                                                {selected.name}
                                            </h3>
                                            <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                                                {selected.coach}-{selected.seatNo || "RAC"} • {selected.status}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelected(null)}
                                        className="popup-close-btn"
                                    >
                                        <FiX size={18} />
                                    </button>
                                </div>

                                {/* Status Badges Row */}
                                <div className="flex gap-2 mb-4">
                                    <span className={`badge ${selected.status === "CNF" ? "badge-success" : "badge-warning"}`}>
                                        {selected.status}
                                    </span>
                                    <span className={`badge ${selected.verified ? "badge-success" : "badge-danger"}`}>
                                        {selected.verified ? "✅ Verified" : "❌ Unverified"}
                                    </span>
                                    {selected.blacklisted && (
                                        <span className="badge badge-danger">⛔ Blacklisted</span>
                                    )}
                                </div>

                                {/* Details Grid */}
                                <div className="popup-details-grid">
                                    {[
                                        ["🚉 Boarding", selected.boarding],
                                        ["📍 Destination", selected.destination],
                                        ["🎫 PNR Group", selected.pnrGroup || "—"],
                                        ["📅 Ticket Date", selected.ticketDate || "—"],
                                        ["🛏️ Berth Type", selected.berthType || "—"],
                                        ["👤 Age", selected.age || "—"],
                                    ].map(([label, val]) => (
                                        <div key={label} className="popup-detail-item">
                                            <span className="popup-detail-label">{label}</span>
                                            <span className="popup-detail-value">{val}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* ID Document Section */}
                                <div className="popup-id-section">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                                            <FiCreditCard size={12} /> Identity Document
                                        </span>
                                        <button
                                            onClick={() => setShowID(!showID)}
                                            className="text-[11px] font-medium"
                                            style={{ color: "var(--accent-blue)", cursor: "pointer", background: "none", border: "none" }}
                                        >
                                            {showID ? "Hide ID" : "View ID"}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 text-[13px]">
                                        <span>{idTypeIcon(selected.idType)}</span>
                                        <span className="font-medium" style={{ color: "var(--text-primary)" }}>{selected.idType}</span>
                                    </div>
                                    <AnimatePresence>
                                        {showID && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-2 p-2.5 rounded-lg text-[13px] font-mono"
                                                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                                            >
                                                {selected.idNumber}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Action Buttons */}
                                <div className="popup-actions">
                                    {!selected.verified && (
                                        <button
                                            onClick={() => handleVerify(selected.id)}
                                            className="btn btn-success flex-1 justify-center py-2.5"
                                        >
                                            <FiCheck size={16} /> Verify Passenger
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { markNoShow(selected.id); setSelected(null); }}
                                        className="btn btn-danger flex-1 justify-center py-2.5"
                                    >
                                        <FiXCircle size={16} /> Mark No Show
                                    </button>
                                    <button
                                        onClick={() => setSelected(null)}
                                        className="btn btn-ghost flex-1 justify-center py-2.5"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* QR Scanner Modal */}
            <QRScannerModal
                isOpen={showQRScanner}
                onClose={() => setShowQRScanner(false)}
                onScan={handleQRScan}
            />
        </div>
    );
}
