import { useState } from "react";
import { useSmartRail } from "../hooks/useSmartRail";
import { motion } from "framer-motion";
import {
    FiUsers, FiRefreshCw, FiCheckCircle, FiArrowDown,
    FiUser, FiGrid, FiList
} from "react-icons/fi";

const berthLabel = (type) => {
    switch (type) {
        case "LB": return { text: "Lower", color: "#16a34a", bg: "#f0fdf4" };
        case "MB": return { text: "Middle", color: "#d97706", bg: "#fffbeb" };
        case "UB": return { text: "Upper", color: "#2563eb", bg: "#eff6ff" };
        case "SL": return { text: "Side Lower", color: "#7c3aed", bg: "#f5f3ff" };
        case "SU": return { text: "Side Upper", color: "#7c3aed", bg: "#f5f3ff" };
        default: return { text: "—", color: "#6b7280", bg: "#f9fafb" };
    }
};

export default function SeatManagementPage() {
    const {
        passengers, pnrGroups, seatSwaps,
        swapSeats, verifyPNRGroup, moveSeniorToLower
    } = useSmartRail();

    const [swapFrom, setSwapFrom] = useState(null);
    const [swapTo, setSwapTo] = useState(null);
    const [activeTab, setActiveTab] = useState("pnr");

    const handleSwap = () => {
        if (!swapFrom || !swapTo || swapFrom === swapTo) return;
        swapSeats(swapFrom, swapTo);
        setSwapFrom(null);
        setSwapTo(null);
    };

    const seniors = passengers.filter(p => (p.age || 0) >= 55 && p.berthType !== "LB" && p.seatNo);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title">Seat Management</h1>
                    <p className="page-subtitle">PNR groups, seat swaps, and berth accommodation</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab("pnr")}
                        className={`btn ${activeTab === "pnr" ? "btn-dark" : "btn-ghost"}`}
                    >
                        <FiGrid size={14} /> PNR Groups
                    </button>
                    <button
                        onClick={() => setActiveTab("swap")}
                        className={`btn ${activeTab === "swap" ? "btn-dark" : "btn-ghost"}`}
                    >
                        <FiRefreshCw size={14} /> Seat Swap
                    </button>
                    <button
                        onClick={() => setActiveTab("senior")}
                        className={`btn ${activeTab === "senior" ? "btn-dark" : "btn-ghost"}`}
                    >
                        <FiArrowDown size={14} /> Senior Berth
                    </button>
                </div>
            </div>

            {/* ─── PNR Groups Tab ─── */}
            {activeTab === "pnr" && (
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        PNR Groups ({Object.keys(pnrGroups).length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(pnrGroups).map(([pnr, members]) => {
                            const allVerified = members.every(p => p.verified);
                            return (
                                <motion.div
                                    key={pnr}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="card-static p-5"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <FiUsers size={14} style={{ color: "var(--accent-blue)" }} />
                                            <span className="font-semibold text-[13px]" style={{ color: "var(--text-primary)" }}>{pnr}</span>
                                            <span className={`badge ${allVerified ? "badge-success" : "badge-warning"}`}>
                                                {allVerified ? "All Verified" : `${members.filter(p => p.verified).length}/${members.length}`}
                                            </span>
                                        </div>
                                        {!allVerified && (
                                            <button
                                                onClick={() => verifyPNRGroup(pnr)}
                                                className="btn btn-success text-[11px] py-1"
                                            >
                                                <FiCheckCircle size={12} /> Verify All
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        {members.map(p => {
                                            const berth = berthLabel(p.berthType);
                                            return (
                                                <div
                                                    key={p.id}
                                                    className="flex items-center justify-between px-3 py-2 rounded-lg text-[13px]"
                                                    style={{ background: "var(--bg-input)" }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <FiUser size={12} style={{ color: "var(--text-muted)" }} />
                                                        <span className="font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</span>
                                                        {p.age >= 55 && <span className="text-[10px]">👴</span>}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                                                            {p.coach}-{p.seatNo || "RAC"}
                                                        </span>
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold" style={{ background: berth.bg, color: berth.color }}>
                                                            {berth.text}
                                                        </span>
                                                        <span className={`badge ${p.verified ? "badge-success" : "badge-danger"}`}>
                                                            {p.verified ? "✓" : "•"}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ─── Seat Swap Tab ─── */}
            {activeTab === "swap" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card-static p-6">
                        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                            Manual Seat Swap
                        </h3>
                        <p className="text-[12px] mb-4" style={{ color: "var(--text-muted)" }}>
                            Select two passengers to swap their seats and berth assignments.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>Passenger 1</label>
                                <select
                                    value={swapFrom || ""}
                                    onChange={e => setSwapFrom(Number(e.target.value))}
                                    className="input-field w-full mt-1"
                                >
                                    <option value="">Select passenger...</option>
                                    {passengers.filter(p => p.seatNo).map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} — {p.coach}-#{p.seatNo} ({p.berthType})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="text-center">
                                <FiRefreshCw size={20} style={{ color: "var(--text-muted)" }} />
                            </div>

                            <div>
                                <label className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>Passenger 2</label>
                                <select
                                    value={swapTo || ""}
                                    onChange={e => setSwapTo(Number(e.target.value))}
                                    className="input-field w-full mt-1"
                                >
                                    <option value="">Select passenger...</option>
                                    {passengers.filter(p => p.seatNo && p.id !== swapFrom).map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} — {p.coach}-#{p.seatNo} ({p.berthType})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleSwap}
                                disabled={!swapFrom || !swapTo}
                                className="btn btn-dark w-full justify-center"
                                style={(!swapFrom || !swapTo) ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                            >
                                <FiRefreshCw size={14} /> Swap Seats
                            </button>
                        </div>
                    </div>

                    {/* Swap History */}
                    <div className="card-static p-6">
                        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                            Swap History ({seatSwaps.length})
                        </h3>
                        {seatSwaps.length === 0 ? (
                            <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
                                <FiRefreshCw size={32} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No swaps performed yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                {seatSwaps.map(swap => (
                                    <motion.div
                                        key={swap.id}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-3 rounded-xl text-[13px]"
                                        style={{ background: "var(--bg-input)", border: "1px solid var(--border-light)" }}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium" style={{ color: "var(--text-primary)" }}>{swap.from.name}</span>
                                            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>#{swap.from.seat} ({swap.from.berth})</span>
                                            <span style={{ color: "var(--text-muted)" }}>↔</span>
                                            <span className="font-medium" style={{ color: "var(--text-primary)" }}>{swap.to.name}</span>
                                            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>#{swap.to.seat} ({swap.to.berth})</span>
                                        </div>
                                        <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                                            🕐 {swap.time} • 📍 {swap.station}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── Senior Berth Tab ─── */}
            {activeTab === "senior" && (
                <div className="card-static p-6">
                    <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                        Senior Citizens — Berth Accommodation
                    </h3>
                    <p className="text-[12px] mb-4" style={{ color: "var(--text-muted)" }}>
                        Passengers aged 55+ not on lower berths. Click "Move to Lower" to swap with a younger passenger on a lower berth.
                    </p>
                    {seniors.length === 0 ? (
                        <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
                            <FiCheckCircle size={32} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">All senior citizens are on lower berths</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {seniors.map(p => {
                                const berth = berthLabel(p.berthType);
                                return (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center justify-between p-4 rounded-xl"
                                        style={{ background: "var(--bg-input)", border: "1px solid var(--border-light)" }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: berth.bg }}>
                                                <span className="text-lg">👴</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-[13px]" style={{ color: "var(--text-primary)" }}>
                                                    {p.name} <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>(Age {p.age})</span>
                                                </p>
                                                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                                                    {p.coach}-#{p.seatNo} •{" "}
                                                    <span style={{ color: berth.color, fontWeight: 600 }}>{berth.text}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => moveSeniorToLower(p.id)}
                                            className="btn btn-dark text-sm"
                                        >
                                            <FiArrowDown size={14} /> Move to Lower
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
