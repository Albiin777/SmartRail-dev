import { useState } from "react";
import { useSmartRail } from "../hooks/useSmartRail";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiRefreshCw, FiLock, FiUnlock, FiUser, FiCheckCircle,
    FiAlertTriangle, FiClock, FiMapPin, FiShield, FiArrowRight
} from "react-icons/fi";

export default function HandoverPage() {
    const {
        ttInfo, handoverState, initiateHandover, acceptHandover,
        cancelHandover, forceTransfer, generateHandoverSummary,
        nearSegmentEnd, currentStation, stats, incidents, noShows, racUpgrades, penalties, revenue
    } = useSmartRail();

    const [newTTId, setNewTTId] = useState("");
    const [newTTName, setNewTTName] = useState("");
    const [confirmSegment, setConfirmSegment] = useState(false);
    const [reviewed, setReviewed] = useState(false);
    const [forceReason, setForceReason] = useState("");
    const [showForce, setShowForce] = useState(false);

    const summary = handoverState.summary || generateHandoverSummary();

    const handleAccept = () => {
        if (!newTTId || !newTTName || !confirmSegment || !reviewed) return;
        acceptHandover(newTTId, newTTName);
        setNewTTId("");
        setNewTTName("");
        setConfirmSegment(false);
        setReviewed(false);
    };

    const handleForce = () => {
        if (!forceReason) return;
        forceTransfer(forceReason);
        setForceReason("");
        setShowForce(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title">TT Handover</h1>
                    <p className="page-subtitle">Transfer duties between TT officers</p>
                </div>
                {nearSegmentEnd && !handoverState.active && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "var(--accent-amber-bg)", border: "1px solid var(--accent-amber-border)" }}>
                        <FiAlertTriangle size={16} style={{ color: "var(--accent-amber)" }} />
                        <span className="text-[13px] font-medium" style={{ color: "var(--accent-amber)" }}>Approaching segment end — handover recommended</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current TT Profile */}
                <div className="card-static p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--bg-input)" }}>
                            <FiUser size={22} style={{ color: "var(--text-primary)" }} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Current TT Officer</h3>
                            <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                                {handoverState.locked ? "🔒 Actions Locked" : "🔓 Active"}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 text-[13px]">
                        {[
                            ["TT ID", ttInfo.employeeId],
                            ["Name", ttInfo.ttName],
                            ["Badge No", ttInfo.badgeNo],
                            ["Assigned Train", `${ttInfo.trainNo} — ${ttInfo.trainName}`],
                            ["Assigned Coaches", ttInfo.coaches.join(", ")],
                            ["Segment", ttInfo.assignedSegment],
                            ["Shift", `${ttInfo.shiftStart} → ${ttInfo.shiftEnd}`],
                            ["Current Station", currentStation],
                        ].map(([label, val]) => (
                            <div key={label} className="flex justify-between">
                                <span style={{ color: "var(--text-muted)" }}>{label}</span>
                                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{val}</span>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    {!handoverState.active && (
                        <div className="mt-5 space-y-2">
                            <button onClick={initiateHandover} className="btn btn-dark w-full justify-center">
                                <FiRefreshCw size={14} /> Initiate Handover
                            </button>
                            <button onClick={() => setShowForce(!showForce)} className="btn btn-danger w-full justify-center">
                                <FiShield size={14} /> Emergency Transfer
                            </button>
                        </div>
                    )}
                    {handoverState.active && !handoverState.newTTId && (
                        <div className="mt-5">
                            <button onClick={cancelHandover} className="btn btn-ghost w-full justify-center">
                                <FiUnlock size={14} /> Cancel Handover
                            </button>
                        </div>
                    )}
                </div>

                {/* Handover Summary */}
                <div className="card-static p-6">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <FiCheckCircle size={16} style={{ color: "var(--accent-green)" }} />
                        Pre-Handover Summary
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: "Total Passengers", val: summary.totalPassengers, color: "navy" },
                            { label: "Verified", val: summary.verified, color: "green" },
                            { label: "Pending Verification", val: summary.pendingVerification, color: "red" },
                            { label: "RAC Pending", val: summary.racPending, color: "amber" },
                            { label: "Vacant Seats", val: summary.vacantSeats, color: "blue" },
                            { label: "Penalties Collected", val: summary.penaltiesCollected, color: "red" },
                            { label: "Incidents Reported", val: summary.incidentsReported, color: "amber" },
                            { label: "Revenue (₹)", val: `₹${summary.revenueCollected.toLocaleString()}`, color: "green" },
                            { label: "No-Shows", val: summary.noShows, color: "red" },
                            { label: "RAC Upgrades", val: summary.racUpgrades, color: "blue" },
                        ].map(item => (
                            <div key={item.label} className={`stat-card ${item.color} !p-3`}>
                                <p className="text-[10px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: "var(--text-muted)" }}>
                                    {item.label}
                                </p>
                                <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{item.val}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
                        <FiClock size={12} className="inline mr-1" /> Summary generated: {summary.timestamp}
                    </div>
                </div>
            </div>

            {/* Emergency Force Transfer */}
            <AnimatePresence>
                {showForce && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="card-static p-6"
                        style={{ border: "2px solid var(--accent-red-border)" }}
                    >
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--accent-red)" }}>
                            <FiShield size={16} /> Emergency Transfer
                        </h3>
                        <p className="text-[12px] mb-4" style={{ color: "var(--text-secondary)" }}>
                            Senior TT can force a transfer when the current TT is unable to continue duties. This action requires a reason.
                        </p>
                        <div className="space-y-3">
                            <select
                                value={forceReason}
                                onChange={e => setForceReason(e.target.value)}
                                className="input-field w-full"
                            >
                                <option value="">Select reason...</option>
                                <option value="TT fell sick during duty">TT fell sick during duty</option>
                                <option value="TT needs immediate replacement">TT needs immediate replacement</option>
                                <option value="Emergency at station">Emergency at station</option>
                                <option value="Other operational issue">Other operational issue</option>
                            </select>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleForce}
                                    disabled={!forceReason}
                                    className="btn btn-danger flex-1"
                                    style={!forceReason ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                                >
                                    <FiShield size={14} /> Force Transfer
                                </button>
                                <button onClick={() => setShowForce(false)} className="btn btn-ghost">Cancel</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* New TT Acceptance */}
            <AnimatePresence>
                {handoverState.active && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="card-static p-6"
                        style={{ border: "2px solid var(--accent-blue-border)" }}
                    >
                        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--accent-blue)" }}>
                            <FiArrowRight size={16} /> New TT — Accept Handover
                        </h3>

                        {handoverState.transferReason && (
                            <div className="p-3 rounded-xl mb-4" style={{ background: "var(--accent-red-bg)", border: "1px solid var(--accent-red-border)" }}>
                                <p className="text-[12px] font-medium" style={{ color: "var(--accent-red)" }}>
                                    ⚠️ Emergency Transfer: {handoverState.transferReason}
                                </p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <label className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>New TT ID *</label>
                                <input
                                    type="text"
                                    value={newTTId}
                                    onChange={e => setNewTTId(e.target.value)}
                                    placeholder="e.g. TT5921"
                                    className="input-field w-full mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>New TT Name *</label>
                                <input
                                    type="text"
                                    value={newTTName}
                                    onChange={e => setNewTTName(e.target.value)}
                                    placeholder="e.g. S. Patel"
                                    className="input-field w-full mt-1"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer text-[13px]" style={{ color: "var(--text-secondary)" }}>
                                    <input type="checkbox" checked={confirmSegment} onChange={e => setConfirmSegment(e.target.checked)} />
                                    I confirm the assigned segment: <strong>{ttInfo.assignedSegment}</strong>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-[13px]" style={{ color: "var(--text-secondary)" }}>
                                    <input type="checkbox" checked={reviewed} onChange={e => setReviewed(e.target.checked)} />
                                    I have reviewed the pre-handover summary and accept responsibility
                                </label>
                            </div>

                            <button
                                onClick={handleAccept}
                                disabled={!newTTId || !newTTName || !confirmSegment || !reviewed}
                                className="btn btn-dark w-full justify-center py-3"
                                style={(!newTTId || !newTTName || !confirmSegment || !reviewed) ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                            >
                                <FiCheckCircle size={14} /> Accept Handover & Take Control
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Completed Handover Info */}
            {handoverState.newTTId && (
                <div className="card-static p-6" style={{ border: "2px solid var(--accent-green-border)" }}>
                    <div className="flex items-center gap-3">
                        <FiCheckCircle size={24} style={{ color: "var(--accent-green)" }} />
                        <div>
                            <h3 className="text-sm font-semibold" style={{ color: "var(--accent-green)" }}>Handover Complete</h3>
                            <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                                Control transferred to <strong>{handoverState.newTTName}</strong> ({handoverState.newTTId})
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
