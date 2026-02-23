import { useState } from "react";
import { useSmartRail } from "../hooks/useSmartRail";
import { motion } from "framer-motion";
import { FiFileText, FiFilter, FiDownload } from "react-icons/fi";
import { exportToCSV, exportToPDF } from "../utils/exportUtils";

const typeColors = {
    verify: { bg: "var(--accent-green-bg)", color: "var(--accent-green)", label: "Verify" },
    penalty: { bg: "var(--accent-red-bg)", color: "var(--accent-red)", label: "Penalty" },
    upgrade: { bg: "var(--accent-amber-bg)", color: "var(--accent-amber)", label: "Upgrade" },
    station: { bg: "var(--accent-blue-bg)", color: "var(--accent-blue)", label: "Station" },
    warning: { bg: "var(--accent-amber-bg)", color: "var(--accent-amber)", label: "Warning" },
    system: { bg: "var(--bg-input)", color: "var(--text-muted)", label: "System" },
    info: { bg: "var(--accent-blue-bg)", color: "var(--accent-blue)", label: "Info" },
    incident: { bg: "var(--accent-red-bg)", color: "var(--accent-red)", label: "Incident" },
};

export default function ReportsPage() {
    const { logs, stats, penalties, incidents, noShows } = useSmartRail();
    const [filter, setFilter] = useState("ALL");

    const filteredLogs = filter === "ALL"
        ? logs
        : logs.filter(l => l.type === filter);

    const handleExportLogsCSV = () => {
        const data = filteredLogs.map(l => ({
            Time: l.time,
            Type: l.type,
            Action: l.action,
        }));
        exportToCSV(data, "smartrail_activity_log");
    };

    const handleExportLogsPDF = () => {
        const data = filteredLogs.map(l => ({
            Time: l.time,
            Type: l.type,
            Action: l.action,
        }));
        exportToPDF(data, "smartrail_activity_log", "SmartRail Activity Report");
    };

    const handleExportPenaltiesCSV = () => {
        const data = penalties.map(p => ({
            ReceiptID: p.receiptId,
            Passenger: p.passengerName,
            Type: p.type,
            Amount: p.amount,
            Coach: p.coach,
            Seat: p.seatNo || "RAC",
            Station: p.station,
            TT: p.ttName,
            Time: p.time,
            Date: p.date,
        }));
        exportToCSV(data, "smartrail_penalties");
    };

    const handleExportIncidentsCSV = () => {
        const data = incidents.map(inc => ({
            IncidentID: inc.id,
            Type: inc.type,
            Description: inc.description,
            Station: inc.station,
            Status: inc.status,
            ReportedBy: inc.reportedBy,
            Time: inc.time,
        }));
        exportToCSV(data, "smartrail_incidents");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title">Reports & Audit Log</h1>
                    <p className="page-subtitle">Comprehensive activity tracking and reporting</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleExportLogsCSV} className="btn btn-outline text-[12px]">
                        <FiDownload size={12} /> Logs CSV
                    </button>
                    <button onClick={handleExportLogsPDF} className="btn btn-outline text-[12px]">
                        <FiDownload size={12} /> Logs PDF
                    </button>
                    <button onClick={handleExportPenaltiesCSV} className="btn btn-outline text-[12px]">
                        <FiDownload size={12} /> Penalties CSV
                    </button>
                    <button onClick={handleExportIncidentsCSV} className="btn btn-outline text-[12px]">
                        <FiDownload size={12} /> Incidents CSV
                    </button>
                </div>
            </div>

            {/* Summary Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="stat-card navy">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Total Actions</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{logs.length}</p>
                </div>
                <div className="stat-card green">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Verifications</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{logs.filter(l => l.type === "verify").length}</p>
                </div>
                <div className="stat-card red">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Penalties</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{penalties.length}</p>
                </div>
                <div className="stat-card amber">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Incidents</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{incidents.length}</p>
                </div>
                <div className="stat-card violet">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>No-Shows</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{noShows.length}</p>
                </div>
                <div className="stat-card blue">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Revenue</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>₹{stats.revenue.toLocaleString()}</p>
                </div>
            </div>

            {/* Audit Log */}
            <div className="card-static p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <FiFileText size={16} /> Activity Log
                    </h3>
                    <div className="flex items-center gap-2">
                        <FiFilter size={14} style={{ color: "var(--text-muted)" }} />
                        <select
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            className="input-field text-[12px]"
                        >
                            <option value="ALL">All Types</option>
                            <option value="verify">Verifications</option>
                            <option value="penalty">Penalties</option>
                            <option value="upgrade">Upgrades</option>
                            <option value="station">Station Changes</option>
                            <option value="incident">Incidents</option>
                            <option value="warning">Warnings</option>
                            <option value="system">System</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--border)" }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: "80px" }}>Time</th>
                                <th style={{ width: "100px" }}>Type</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log, i) => {
                                const tc = typeColors[log.type] || typeColors.info;
                                return (
                                    <motion.tr
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.02 }}
                                    >
                                        <td className="font-mono text-[12px]" style={{ color: "var(--text-muted)" }}>{log.time}</td>
                                        <td>
                                            <span
                                                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold"
                                                style={{ background: tc.bg, color: tc.color }}
                                            >
                                                {tc.label}
                                            </span>
                                        </td>
                                        <td style={{ color: "var(--text-secondary)" }}>{log.action}</td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredLogs.length === 0 && (
                    <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
                        <FiFileText size={32} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No activity logs for this filter</p>
                    </div>
                )}
            </div>
        </div>
    );
}
