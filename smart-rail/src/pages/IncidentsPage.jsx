import { useState } from "react";
import { useSmartRail } from "../hooks/useSmartRail";
import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiPlus, FiShield, FiActivity, FiPackage, FiUsers, FiAlertCircle } from "react-icons/fi";

const incidentTypes = [
    { type: "Medical Emergency", icon: FiActivity, color: "#dc2626", bg: "#fef2f2" },
    { type: "Seat Dispute", icon: FiUsers, color: "#d97706", bg: "#fffbeb" },
    { type: "Unauthorized Vendor", icon: FiPackage, color: "#7c3aed", bg: "#f5f3ff" },
    { type: "Suspicious Luggage", icon: FiShield, color: "#dc2626", bg: "#fef2f2" },
    { type: "Passenger Misbehavior", icon: FiAlertTriangle, color: "#ea580c", bg: "#fff7ed" },
];

const severityBadge = (type) => {
    switch (type) {
        case "Medical Emergency":
        case "Suspicious Luggage":
            return { label: "CRITICAL", cls: "badge-danger" };
        case "Seat Dispute":
        case "Passenger Misbehavior":
            return { label: "HIGH", cls: "badge-warning" };
        default:
            return { label: "MEDIUM", cls: "badge-info" };
    }
};

export default function IncidentsPage() {
    const { incidents, logIncident, updateIncidentStatus, currentStation } = useSmartRail();
    const [showForm, setShowForm] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [description, setDescription] = useState("");
    const [details, setDetails] = useState("");

    const handleSubmit = () => {
        if (!selectedType || !description) return;
        logIncident(selectedType, description, details);
        setSelectedType(null);
        setDescription("");
        setDetails("");
        setShowForm(false);
    };

    const openCount = incidents.filter(i => i.status === "Open").length;
    const resolvedCount = incidents.filter(i => i.status === "Resolved").length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title">Incident Logging</h1>
                    <p className="page-subtitle">Report and track operational safety incidents</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-dark">
                    <FiPlus size={14} /> Log Incident
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="stat-card red">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Total Incidents</p>
                    <p className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{incidents.length}</p>
                </div>
                <div className="stat-card amber">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Open</p>
                    <p className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{openCount}</p>
                </div>
                <div className="stat-card green">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Resolved</p>
                    <p className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{resolvedCount}</p>
                </div>
            </div>

            {/* Quick Log Buttons */}
            <div className="card-static p-6">
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Quick Report</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {incidentTypes.map(it => (
                        <motion.button
                            key={it.type}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { setSelectedType(it.type); setShowForm(true); }}
                            className="p-4 rounded-xl text-center transition-all cursor-pointer"
                            style={{
                                background: selectedType === it.type ? it.bg : "var(--bg-input)",
                                border: selectedType === it.type ? `2px solid ${it.color}` : "1px solid var(--border-light)",
                            }}
                        >
                            <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: it.bg }}>
                                <it.icon size={20} style={{ color: it.color }} />
                            </div>
                            <p className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>{it.type}</p>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Log Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="card-static p-6"
                    >
                        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                            {selectedType ? `Report: ${selectedType}` : "Select Incident Type Above"}
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>Description *</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Brief description of the incident..."
                                    className="input-field w-full mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>Additional Details</label>
                                <textarea
                                    value={details}
                                    onChange={e => setDetails(e.target.value)}
                                    placeholder="Any additional context, passenger names, seat numbers..."
                                    rows={3}
                                    className="input-field w-full mt-1"
                                    style={{ resize: "vertical" }}
                                />
                            </div>
                            <div className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                                📍 Station: <strong>{currentStation}</strong>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!selectedType || !description}
                                    className="btn btn-dark flex-1"
                                    style={(!selectedType || !description) ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                                >
                                    <FiAlertCircle size={14} /> Submit Incident Report
                                </button>
                                <button onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Incidents List */}
            <div className="card-static p-6">
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    Incident Log ({incidents.length})
                </h3>
                {incidents.length === 0 ? (
                    <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
                        <FiShield size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No incidents reported</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {incidents.map(inc => {
                            const sev = severityBadge(inc.type);
                            const typeInfo = incidentTypes.find(t => t.type === inc.type);
                            return (
                                <motion.div
                                    key={inc.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-4 rounded-xl"
                                    style={{ background: "var(--bg-input)", border: "1px solid var(--border-light)" }}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: typeInfo?.bg || "var(--bg-input)" }}>
                                                {typeInfo && <typeInfo.icon size={16} style={{ color: typeInfo.color }} />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[13px]" style={{ color: "var(--text-primary)" }}>{inc.type}</p>
                                                <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{inc.description}</p>
                                            </div>
                                        </div>
                                        <span className={`badge ${sev.cls}`}>{sev.label}</span>
                                    </div>
                                    {inc.details && (
                                        <p className="text-[11px] mb-2 pl-12" style={{ color: "var(--text-muted)" }}>{inc.details}</p>
                                    )}
                                    <div className="flex items-center justify-between pl-12">
                                        <div className="text-[11px] space-x-3" style={{ color: "var(--text-muted)" }}>
                                            <span>🆔 {inc.id}</span>
                                            <span>📍 {inc.station}</span>
                                            <span>🕐 {inc.time}</span>
                                            <span>👤 {inc.reportedBy}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            {inc.status === "Open" && (
                                                <button onClick={() => updateIncidentStatus(inc.id, "Resolved")} className="btn btn-ghost text-[11px] py-1">
                                                    Resolve
                                                </button>
                                            )}
                                            <span className={`badge ${inc.status === "Open" ? "badge-warning" : "badge-success"}`}>{inc.status}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
