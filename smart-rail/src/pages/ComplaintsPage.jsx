import { useState } from "react";
import { useSmartRail } from "../hooks/useSmartRail";
import { motion } from "framer-motion";
import { FiAlertCircle, FiPlus, FiCheckCircle, FiClock, FiLoader } from "react-icons/fi";

const categories = ["Cleanliness", "Staff Behaviour", "Safety", "Delay", "Food Quality", "Other"];

const statusConfig = {
    "Open": { badge: "badge-danger", icon: FiAlertCircle },
    "In Progress": { badge: "badge-warning", icon: FiLoader },
    "Resolved": { badge: "badge-success", icon: FiCheckCircle },
};

export default function ComplaintsPage() {
    const { complaints, addComplaint, updateComplaintStatus, passengers } = useSmartRail();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ passenger: "", category: "", description: "", priority: "Medium" });
    const [filter, setFilter] = useState("ALL");

    const filteredComplaints = filter === "ALL"
        ? complaints
        : complaints.filter(c => c.status === filter);

    const handleSubmit = () => {
        if (!form.passenger || !form.category || !form.description) return;
        addComplaint(form.passenger, form.category, form.description, form.priority);
        setForm({ passenger: "", category: "", description: "", priority: "Medium" });
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title">Complaint Management</h1>
                    <p className="page-subtitle">View, manage, and resolve passenger complaints</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-dark">
                    <FiPlus size={16} /> New Complaint
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                <div className="stat-card red">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Open</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                        {complaints.filter(c => c.status === "Open").length}
                    </p>
                </div>
                <div className="stat-card amber">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>In Progress</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                        {complaints.filter(c => c.status === "In Progress").length}
                    </p>
                </div>
                <div className="stat-card green">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Resolved</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                        {complaints.filter(c => c.status === "Resolved").length}
                    </p>
                </div>
            </div>

            {/* New Complaint Form */}
            {showForm && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="card-static p-6"
                >
                    <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>File New Complaint</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[11px] uppercase tracking-wider font-semibold block mb-1.5" style={{ color: "var(--text-muted)" }}>Passenger</label>
                            <select value={form.passenger} onChange={e => setForm({ ...form, passenger: e.target.value })} className="input-field w-full">
                                <option value="">Select passenger...</option>
                                {passengers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] uppercase tracking-wider font-semibold block mb-1.5" style={{ color: "var(--text-muted)" }}>Category</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field w-full">
                                <option value="">Select category...</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] uppercase tracking-wider font-semibold block mb-1.5" style={{ color: "var(--text-muted)" }}>Priority</label>
                            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="input-field w-full">
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] uppercase tracking-wider font-semibold block mb-1.5" style={{ color: "var(--text-muted)" }}>Description</label>
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue..." rows={2} className="input-field w-full resize-none" />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button onClick={handleSubmit} className="btn btn-dark">Submit Complaint</button>
                        <button onClick={() => setShowForm(false)} className="btn btn-outline">Cancel</button>
                    </div>
                </motion.div>
            )}

            {/* Filter */}
            <div className="flex gap-2">
                {["ALL", "Open", "In Progress", "Resolved"].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`btn ${filter === f ? "btn-outline active" : "btn-outline"} text-[12px]`}
                    >
                        {f === "ALL" ? "All" : f}
                    </button>
                ))}
            </div>

            {/* Complaint List */}
            <div className="space-y-3">
                {filteredComplaints.map((c, i) => {
                    const sc = statusConfig[c.status] || statusConfig.Open;
                    return (
                        <motion.div
                            key={c.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="card-static p-5"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{c.passengerName}</span>
                                        <span className={`badge ${sc.badge}`}>{c.status}</span>
                                        <span className={`badge ${c.priority === "Critical" || c.priority === "High" ? "badge-danger" : c.priority === "Medium" ? "badge-warning" : "badge-info"}`}>
                                            {c.priority}
                                        </span>
                                    </div>
                                    <p className="text-[13px] mb-1" style={{ color: "var(--text-secondary)" }}>{c.description}</p>
                                    <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
                                        <span>{c.category}</span>
                                        <span>•</span>
                                        <span>{c.time}, {c.date}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    {c.status === "Open" && (
                                        <button onClick={() => updateComplaintStatus(c.id, "In Progress")} className="btn btn-ghost text-[11px]">
                                            <FiClock size={12} /> In Progress
                                        </button>
                                    )}
                                    {c.status !== "Resolved" && (
                                        <button onClick={() => updateComplaintStatus(c.id, "Resolved")} className="btn btn-success text-[11px]">
                                            <FiCheckCircle size={12} /> Resolve
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
