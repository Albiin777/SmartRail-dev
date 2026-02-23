import { useState } from "react";
import { useSmartRail } from "../hooks/useSmartRail";
import { motion } from "framer-motion";
import { FiAlertTriangle, FiDownload, FiUser } from "react-icons/fi";

const penaltyTypes = [
    { type: "NO_TICKET", label: "No Ticket", amount: "₹1,000", color: "red" },
    { type: "WRONG_COACH", label: "Wrong Coach", amount: "₹500", color: "amber" },
    { type: "OTHER", label: "Other Violation", amount: "₹300", color: "navy" },
];

export default function PenaltyPage() {
    const { passengers, penalties, issuePenalty, downloadPenaltyPDF } = useSmartRail();
    const [selectedPassenger, setSelectedPassenger] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredPassengers = passengers.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleIssuePenalty = () => {
        if (!selectedPassenger || !selectedType) return;
        issuePenalty(selectedPassenger, selectedType);
        setSelectedPassenger(null);
        setSelectedType(null);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-title">Penalty Management</h1>
                <p className="page-subtitle">Issue fines and manage penalty records</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">

                    {/* Penalty Type Cards */}
                    <div className="card-static p-6">
                        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Select Violation Type</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {penaltyTypes.map(pt => (
                                <motion.div
                                    key={pt.type}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedType(pt.type)}
                                    className={`stat-card ${pt.color} cursor-pointer`}
                                    style={{
                                        boxShadow: selectedType === pt.type ? "0 0 0 2px var(--accent-black)" : "none",
                                    }}
                                >
                                    <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                                        {pt.label}
                                    </p>
                                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{pt.amount}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Select passenger */}
                    <div className="card-static p-6">
                        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Select Passenger</h3>
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="input-field w-full mb-4"
                        />
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {filteredPassengers.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedPassenger(p)}
                                    className="flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition-all text-[13px]"
                                    style={{
                                        background: selectedPassenger?.id === p.id ? "var(--accent-red-bg)" : "transparent",
                                        border: selectedPassenger?.id === p.id ? "1px solid var(--accent-red-border)" : "1px solid transparent",
                                    }}
                                    onMouseEnter={e => {
                                        if (selectedPassenger?.id !== p.id) e.currentTarget.style.background = "var(--bg-input)";
                                    }}
                                    onMouseLeave={e => {
                                        if (selectedPassenger?.id !== p.id) e.currentTarget.style.background = "transparent";
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--bg-input)" }}>
                                            <FiUser size={14} style={{ color: "var(--text-muted)" }} />
                                        </div>
                                        <div>
                                            <span className="font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</span>
                                            <span className="ml-2 text-[12px]" style={{ color: "var(--text-muted)" }}>
                                                {p.coach}-{p.seatNo || "RAC"}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`badge ${p.status === "CNF" ? "badge-success" : "badge-warning"}`}>
                                        {p.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Issue Button */}
                    <button
                        onClick={handleIssuePenalty}
                        disabled={!selectedPassenger || !selectedType}
                        className={`btn w-full py-3 justify-center text-sm font-semibold ${selectedPassenger && selectedType
                            ? "btn-dark"
                            : ""
                            }`}
                        style={
                            (!selectedPassenger || !selectedType) ? {
                                background: "var(--bg-input)",
                                color: "var(--text-muted)",
                                cursor: "not-allowed"
                            } : {}
                        }
                    >
                        <FiAlertTriangle size={16} />
                        {selectedPassenger && selectedType
                            ? `Issue Penalty to ${selectedPassenger.name}`
                            : "Select passenger and violation type"
                        }
                    </button>
                </div>

                {/* Penalty History */}
                <div className="card-static p-6">
                    <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                        Penalty History ({penalties.length})
                    </h3>

                    {penalties.length === 0 ? (
                        <div className="text-center py-10" style={{ color: "var(--text-muted)" }}>
                            <FiAlertTriangle size={32} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No penalties issued yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {penalties.map(p => (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-3 rounded-xl"
                                    style={{ background: "var(--bg-input)", border: "1px solid var(--border-light)" }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-[13px]" style={{ color: "var(--text-primary)" }}>{p.passengerName}</span>
                                        <span className="badge badge-danger">₹{p.amount}</span>
                                    </div>
                                    <div className="text-[11px] space-y-0.5" style={{ color: "var(--text-muted)" }}>
                                        <p>🆔 {p.receiptId}</p>
                                        <p>{p.coach}-{p.seatNo || "RAC"} • {p.type.replace("_", " ")}</p>
                                        <p>📍 {p.station} • 🕐 {p.time} • {p.date}</p>
                                        <p>👤 {p.ttName} ({p.ttId}) • 🚆 {p.trainNo}</p>
                                    </div>
                                    <button
                                        onClick={() => downloadPenaltyPDF(
                                            { name: p.passengerName, coach: p.coach, seatNo: p.seatNo, penaltyType: p.type },
                                            p.amount
                                        )}
                                        className="btn btn-outline text-[11px] mt-2 py-1"
                                    >
                                        <FiDownload size={12} /> Download Receipt (PDF + QR)
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
