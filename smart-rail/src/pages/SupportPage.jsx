import { useState } from "react";
import { useSmartRail } from "../hooks/useSmartRail";
import { motion } from "framer-motion";
import { FiPlus, FiCheckCircle, FiClock, FiAlertCircle, FiHeadphones } from "react-icons/fi";

const priorityBadge = {
    Low: "badge-info",
    Medium: "badge-warning",
    High: "badge-danger",
    Critical: "badge-danger",
};

const statusConfig = {
    Open: { badge: "badge-danger", label: "Open" },
    "In Progress": { badge: "badge-warning", label: "In Progress" },
    Resolved: { badge: "badge-success", label: "Resolved" },
    Closed: { badge: "badge-info", label: "Closed" },
};

export default function SupportPage() {
    const { supportTickets, addSupportTicket, updateSupportTicketStatus } = useSmartRail();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ subject: "", description: "", priority: "Medium" });

    const handleSubmit = () => {
        if (!form.subject || !form.description) return;
        addSupportTicket(form.subject, form.description, form.priority);
        setForm({ subject: "", description: "", priority: "Medium" });
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title">Support Management</h1>
                    <p className="page-subtitle">Create and manage support tickets</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-dark">
                    <FiPlus size={16} /> New Ticket
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-card navy">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Total Tickets</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{supportTickets.length}</p>
                </div>
                <div className="stat-card red">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Open</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{supportTickets.filter(t => t.status === "Open").length}</p>
                </div>
                <div className="stat-card amber">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>In Progress</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{supportTickets.filter(t => t.status === "In Progress").length}</p>
                </div>
                <div className="stat-card green">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Resolved</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{supportTickets.filter(t => t.status === "Resolved" || t.status === "Closed").length}</p>
                </div>
            </div>

            {/* New Ticket Form */}
            {showForm && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="card-static p-6"
                >
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <FiHeadphones size={16} style={{ color: "var(--accent-blue)" }} />
                        Create Support Ticket
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[11px] uppercase tracking-wider font-semibold block mb-1.5" style={{ color: "var(--text-muted)" }}>Subject</label>
                            <input
                                type="text"
                                value={form.subject}
                                onChange={e => setForm({ ...form, subject: e.target.value })}
                                placeholder="Briefly describe the issue..."
                                className="input-field w-full"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[11px] uppercase tracking-wider font-semibold block mb-1.5" style={{ color: "var(--text-muted)" }}>Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Provide detailed description..."
                                    rows={3}
                                    className="input-field w-full resize-none"
                                />
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
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleSubmit} className="btn btn-dark">Submit Ticket</button>
                            <button onClick={() => setShowForm(false)} className="btn btn-outline">Cancel</button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Ticket List */}
            <div className="space-y-3">
                {supportTickets.length === 0 ? (
                    <div className="card-static p-12 text-center" style={{ color: "var(--text-muted)" }}>
                        <FiHeadphones size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No support tickets yet</p>
                    </div>
                ) : (
                    supportTickets.map((ticket, i) => {
                        const sc = statusConfig[ticket.status] || statusConfig.Open;
                        return (
                            <motion.div
                                key={ticket.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="card-static p-5"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{ticket.subject}</span>
                                            <span className={`badge ${sc.badge}`}>{sc.label}</span>
                                            <span className={`badge ${priorityBadge[ticket.priority]}`}>{ticket.priority}</span>
                                        </div>
                                        <p className="text-[13px] mb-2" style={{ color: "var(--text-secondary)" }}>{ticket.description}</p>
                                        <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
                                            <span>By {ticket.createdBy}</span>
                                            <span>•</span>
                                            <span>{ticket.time}, {ticket.date}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4 shrink-0">
                                        {ticket.status === "Open" && (
                                            <button onClick={() => updateSupportTicketStatus(ticket.id, "In Progress")} className="btn btn-ghost text-[11px]">
                                                <FiClock size={12} /> Start
                                            </button>
                                        )}
                                        {ticket.status !== "Resolved" && ticket.status !== "Closed" && (
                                            <button onClick={() => updateSupportTicketStatus(ticket.id, "Resolved")} className="btn btn-success text-[11px]">
                                                <FiCheckCircle size={12} /> Resolve
                                            </button>
                                        )}
                                        {ticket.status === "Resolved" && (
                                            <button onClick={() => updateSupportTicketStatus(ticket.id, "Closed")} className="btn btn-outline text-[11px]">
                                                Close
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
