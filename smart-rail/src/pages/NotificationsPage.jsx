import { useSmartRail } from "../hooks/useSmartRail";
import { motion } from "framer-motion";
import { FiBell, FiCheck, FiCheckCircle, FiAlertTriangle, FiInfo, FiAlertCircle, FiSettings } from "react-icons/fi";

const typeConfig = {
    info: { icon: FiInfo, bg: "var(--accent-blue-bg)", color: "var(--accent-blue)", border: "var(--accent-blue-border)" },
    alert: { icon: FiAlertCircle, bg: "var(--accent-red-bg)", color: "var(--accent-red)", border: "var(--accent-red-border)" },
    warning: { icon: FiAlertTriangle, bg: "var(--accent-amber-bg)", color: "var(--accent-amber)", border: "var(--accent-amber-border)" },
    system: { icon: FiSettings, bg: "var(--bg-input)", color: "var(--text-muted)", border: "var(--border)" },
};

export default function NotificationsPage() {
    const { notifications, markNotificationRead, markAllNotificationsRead, unreadNotifications } = useSmartRail();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title">Notifications</h1>
                    <p className="page-subtitle">
                        {unreadNotifications > 0 ? `${unreadNotifications} unread notification${unreadNotifications > 1 ? "s" : ""}` : "All caught up!"}
                    </p>
                </div>
                {unreadNotifications > 0 && (
                    <button onClick={markAllNotificationsRead} className="btn btn-outline">
                        <FiCheckCircle size={14} /> Mark All Read
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-card navy">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Total</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{notifications.length}</p>
                </div>
                <div className="stat-card red">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Unread</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{unreadNotifications}</p>
                </div>
                <div className="stat-card amber">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Warnings</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{notifications.filter(n => n.type === "warning").length}</p>
                </div>
                <div className="stat-card blue">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Alerts</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{notifications.filter(n => n.type === "alert").length}</p>
                </div>
            </div>

            {/* Notification List */}
            <div className="space-y-2">
                {notifications.map((n, i) => {
                    const tc = typeConfig[n.type] || typeConfig.info;
                    const Icon = tc.icon;
                    return (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="card-static p-4 flex items-start gap-4"
                            style={{
                                borderLeft: `3px solid ${tc.color}`,
                                opacity: n.read ? 0.7 : 1,
                            }}
                        >
                            <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                style={{ background: tc.bg }}
                            >
                                <Icon size={16} style={{ color: tc.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{n.title}</span>
                                    {!n.read && (
                                        <div className="w-2 h-2 rounded-full" style={{ background: tc.color }} />
                                    )}
                                </div>
                                <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{n.message}</p>
                                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{n.time}</span>
                            </div>
                            {!n.read && (
                                <button
                                    onClick={() => markNotificationRead(n.id)}
                                    className="btn btn-ghost text-[11px] shrink-0"
                                >
                                    <FiCheck size={12} /> Read
                                </button>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
