import { useState } from "react";
import { keralaTrains, allIndiaTrains } from "../data/trainDirectory";
import { motion } from "framer-motion";
import { FiMapPin, FiClock, FiZap } from "react-icons/fi";

const statusBadge = (status) => {
    if (status === "On Time") return "badge-success";
    if (status === "Running") return "badge-info";
    if (status === "Delayed") return "badge-danger";
    return "badge-info";
};

const typeBadge = (type) => {
    if (type === "Rajdhani") return { bg: "#fef2f2", color: "#dc2626" };
    if (type === "Shatabdi") return { bg: "#eff6ff", color: "#2563eb" };
    if (type === "Duronto") return { bg: "#f5f3ff", color: "#7c3aed" };
    if (type === "Superfast") return { bg: "#fffbeb", color: "#d97706" };
    if (type === "Jan Shatabdi") return { bg: "#ecfdf5", color: "#059669" };
    return { bg: "var(--bg-input)", color: "var(--text-secondary)" };
};

function TrainCard({ train, index }) {
    const tb = typeBadge(train.type);
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="card p-5"
        >
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>{train.name}</span>
                        <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                            style={{ background: tb.bg, color: tb.color }}
                        >
                            {train.type}
                        </span>
                    </div>
                    <span className="text-[12px] font-mono" style={{ color: "var(--text-muted)" }}>#{train.trainNo}</span>
                </div>
                <span className={`badge ${statusBadge(train.status)}`}>
                    {train.status}{train.delay > 0 ? ` +${train.delay}m` : ""}
                </span>
            </div>

            <div className="flex items-center gap-3 mb-3 text-[13px]">
                <div className="flex items-center gap-1.5">
                    <FiMapPin size={13} style={{ color: "var(--accent-green)" }} />
                    <span style={{ color: "var(--text-primary)" }}>{train.from}</span>
                </div>
                <span style={{ color: "var(--text-muted)" }}>→</span>
                <div className="flex items-center gap-1.5">
                    <FiMapPin size={13} style={{ color: "var(--accent-red)" }} />
                    <span style={{ color: "var(--text-primary)" }}>{train.to}</span>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
                <div>
                    <p className="mb-0.5">Departs</p>
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{train.departure}</p>
                </div>
                <div>
                    <p className="mb-0.5">Arrives</p>
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{train.arrival}</p>
                </div>
                <div>
                    <p className="mb-0.5">Speed</p>
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{train.speed}</p>
                </div>
                <div>
                    <p className="mb-0.5">Coaches</p>
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{train.coaches}</p>
                </div>
            </div>
        </motion.div>
    );
}

export default function TrainDirectoryPage() {
    const [tab, setTab] = useState("kerala");
    const [typeFilter, setTypeFilter] = useState("ALL");

    const trains = tab === "kerala" ? keralaTrains : allIndiaTrains;
    const filtered = typeFilter === "ALL"
        ? trains
        : trains.filter(t => t.type === typeFilter);

    const allTypes = [...new Set(trains.map(t => t.type))];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-title">Train Directory</h1>
                <p className="page-subtitle">Live status of running trains</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => { setTab("kerala"); setTypeFilter("ALL"); }}
                    className={`btn ${tab === "kerala" ? "btn-outline active" : "btn-outline"}`}
                >
                    <FiMapPin size={14} /> Kerala Trains ({keralaTrains.length})
                </button>
                <button
                    onClick={() => { setTab("india"); setTypeFilter("ALL"); }}
                    className={`btn ${tab === "india" ? "btn-outline active" : "btn-outline"}`}
                >
                    <FiZap size={14} /> All India ({allIndiaTrains.length})
                </button>
            </div>

            {/* Type Filters */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setTypeFilter("ALL")}
                    className={`btn text-[12px] ${typeFilter === "ALL" ? "btn-dark" : "btn-ghost"}`}
                >
                    All Types
                </button>
                {allTypes.map(t => (
                    <button
                        key={t}
                        onClick={() => setTypeFilter(t)}
                        className={`btn text-[12px] ${typeFilter === t ? "btn-dark" : "btn-ghost"}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="stat-card green">
                    <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "var(--text-muted)" }}>On Time</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                        {trains.filter(t => t.status === "On Time").length}
                    </p>
                </div>
                <div className="stat-card blue">
                    <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "var(--text-muted)" }}>Running</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                        {trains.filter(t => t.status === "Running").length}
                    </p>
                </div>
                <div className="stat-card red">
                    <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "var(--text-muted)" }}>Delayed</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                        {trains.filter(t => t.status === "Delayed").length}
                    </p>
                </div>
            </div>

            {/* Train Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((train, i) => (
                    <TrainCard key={train.trainNo} train={train} index={i} />
                ))}
            </div>
        </div>
    );
}
