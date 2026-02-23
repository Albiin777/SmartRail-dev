import CountUp from "react-countup";
import { useSmartRail } from "../hooks/useSmartRail";
import { motion } from "framer-motion";
import {
    FiUsers, FiCheckCircle, FiAlertTriangle, FiDollarSign,
    FiClock, FiTrendingUp, FiNavigation, FiChevronRight,
    FiUserPlus, FiActivity, FiXCircle, FiRefreshCw, FiArrowUpCircle
} from "react-icons/fi";

const statCards = [
    { key: "totalPassengers", label: "Total Passengers", icon: FiUsers, color: "navy", iconBg: "#eef2ff", iconColor: "#4f46e5" },
    { key: "verified", label: "Verified", icon: FiCheckCircle, color: "green", iconBg: "#f0fdf4", iconColor: "#16a34a" },
    { key: "unverified", label: "Unverified", icon: FiClock, color: "red", iconBg: "#fef2f2", iconColor: "#dc2626" },
    { key: "rac", label: "RAC Waitlist", icon: FiTrendingUp, color: "amber", iconBg: "#fffbeb", iconColor: "#d97706" },
    { key: "noShows", label: "No-Shows Detected", icon: FiXCircle, color: "red", iconBg: "#fef2f2", iconColor: "#dc2626" },
    { key: "boardingMismatch", label: "Boarding Mismatch", icon: FiAlertTriangle, color: "amber", iconBg: "#fffbeb", iconColor: "#d97706" },
    { key: "penaltiesCount", label: "Penalties Issued", icon: FiAlertTriangle, color: "red", iconBg: "#fef2f2", iconColor: "#dc2626" },
    { key: "racUpgrades", label: "RAC Upgrades", icon: FiArrowUpCircle, color: "blue", iconBg: "#eff6ff", iconColor: "#2563eb" },
    { key: "vacantSeatsFilled", label: "Vacant Filled", icon: FiRefreshCw, color: "green", iconBg: "#f0fdf4", iconColor: "#16a34a" },
    { key: "revenue", label: "Revenue (₹)", icon: FiDollarSign, color: "blue", iconBg: "#eff6ff", iconColor: "#2563eb", prefix: "₹" },
];

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.04 } }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

export default function HomePage() {
    const {
        stats, ttInfo, stations, stationIndex, logs, nextStation,
        nextStationName, nextStationBoarding, time, unreadNotifications,
        expectedBoardingList, boardingMissedList, currentStation, incidents
    } = useSmartRail();

    const verificationPct = stats.totalPassengers > 0
        ? Math.round((stats.verified / stats.totalPassengers) * 100)
        : 0;

    return (
        <div className="space-y-8">
            {/* Page Header with Live Clock */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="page-title">Live Dashboard</h1>
                    <p className="page-subtitle">Real-time operations overview</p>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2">
                        <div className="pulse-dot" />
                        <span className="text-[13px] font-medium" style={{ color: "var(--accent-green)" }}>LIVE</span>
                    </div>
                    <p className="text-[22px] font-bold font-mono mt-1" style={{ color: "var(--text-primary)" }}>
                        {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{ttInfo.date}</p>
                </div>
            </div>

            {/* Statistics Grid — 10 cards */}
            <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {statCards.map(card => (
                    <motion.div key={card.key} variants={item} className={`stat-card ${card.color}`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
                                    {card.label}
                                </p>
                                <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                                    {card.prefix || ""}
                                    <CountUp end={stats[card.key]} duration={1.2} separator="," />
                                </p>
                            </div>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: card.iconBg }}>
                                <card.icon size={16} style={{ color: card.iconColor }} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Live Metrics Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Next Station Boarding */}
                <motion.div
                    className="stat-card violet"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
                                Boarding at {nextStationName || "—"}
                            </p>
                            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                                <CountUp end={nextStationBoarding} duration={1} />
                            </p>
                            <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>passengers entering</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#f5f3ff" }}>
                            <FiUserPlus size={16} style={{ color: "#7c3aed" }} />
                        </div>
                    </div>
                </motion.div>

                {/* Verification Progress */}
                <motion.div
                    className="stat-card green"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 }}
                >
                    <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
                        Verification Progress
                    </p>
                    <p className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>{verificationPct}%</p>
                    <div className="w-full h-2 rounded-full" style={{ background: "var(--bg-input)" }}>
                        <motion.div
                            className="h-2 rounded-full"
                            style={{ background: "var(--accent-green)" }}
                            initial={{ width: 0 }}
                            animate={{ width: `${verificationPct}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                    </div>
                </motion.div>

                {/* Incidents */}
                <motion.div
                    className="stat-card red"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.38 }}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
                                Incidents
                            </p>
                            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{incidents.length}</p>
                            <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>reported today</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#fef2f2" }}>
                            <FiAlertTriangle size={16} style={{ color: "#dc2626" }} />
                        </div>
                    </div>
                </motion.div>

                {/* Unread Notifications */}
                <motion.div
                    className="stat-card amber"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
                                Notifications
                            </p>
                            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{unreadNotifications}</p>
                            <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>unread alerts</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#fffbeb" }}>
                            <FiActivity size={16} style={{ color: "#d97706" }} />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Boarding Lists */}
            {(expectedBoardingList.length > 0 || boardingMissedList.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {expectedBoardingList.length > 0 && (
                        <div className="card-static p-5">
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--accent-blue)" }}>
                                📋 Expected Boarding — {currentStation}
                            </h3>
                            <div className="space-y-2">
                                {expectedBoardingList.map(p => (
                                    <div key={p.id} className="flex justify-between px-3 py-2 rounded-lg text-[13px]" style={{ background: "var(--accent-blue-bg)" }}>
                                        <span style={{ color: "var(--text-primary)" }}>{p.name}</span>
                                        <span style={{ color: "var(--text-muted)" }}>{p.coach}-{p.seatNo || "RAC"}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {boardingMissedList.length > 0 && (
                        <div className="card-static p-5">
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--accent-red)" }}>
                                ⚠️ Boarding Missed
                            </h3>
                            <div className="space-y-2">
                                {boardingMissedList.map(p => (
                                    <div key={p.id} className="flex justify-between px-3 py-2 rounded-lg text-[13px]" style={{ background: "var(--accent-red-bg)" }}>
                                        <span style={{ color: "var(--text-primary)" }}>{p.name} (from {p.boarding})</span>
                                        <span style={{ color: "var(--text-muted)" }}>{p.coach}-{p.seatNo || "RAC"}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Info Cards Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Train Details */}
                <motion.div className="card-static p-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <span className="text-lg">🚆</span> Train Details
                    </h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-[13px]">
                        {[
                            ["Train No", ttInfo.trainNo],
                            ["Name", ttInfo.trainName],
                            ["Route", ttInfo.route],
                            ["Date", ttInfo.date],
                            ["Assigned Coach", ttInfo.coach],
                            ["Duty Section", `${ttInfo.fromStation} → ${ttInfo.toStation}`],
                        ].map(([label, val]) => (
                            <div key={label}>
                                <span style={{ color: "var(--text-muted)" }}>{label}</span>
                                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{val}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Station Progress */}
                <motion.div className="card-static p-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                            <FiNavigation size={16} style={{ color: "var(--accent-green)" }} />
                            Station Progress
                        </h3>
                        <button onClick={nextStation} className="btn btn-outline text-[12px] py-1.5">
                            Next Station <FiChevronRight size={14} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {stations.map((s, i) => (
                            <div key={s} className="flex items-center gap-3">
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full border-2" style={{
                                        borderColor: i <= stationIndex ? "var(--accent-green)" : "var(--border-dark)",
                                        background: i <= stationIndex ? "var(--accent-green)" : "transparent",
                                    }} />
                                    {i < stations.length - 1 && (
                                        <div className="w-0.5 h-5" style={{
                                            background: i < stationIndex ? "var(--accent-green)" : "var(--border)",
                                        }} />
                                    )}
                                </div>
                                <span className={`text-[13px] ${i === stationIndex ? "font-bold" : ""}`} style={{
                                    color: i === stationIndex ? "var(--accent-green)" :
                                        i < stationIndex ? "var(--text-secondary)" : "var(--text-muted)"
                                }}>
                                    {s}
                                    {i === stationIndex && <span className="badge badge-success ml-2">Current</span>}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div className="card-static p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Recent Activity</h3>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                    {logs.slice(0, 20).map((log, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 py-2 px-3 rounded-lg text-[13px]"
                            style={{ color: "var(--text-secondary)" }}
                            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-input)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                            <span className="font-mono text-[11px] w-12 shrink-0" style={{ color: "var(--text-muted)" }}>{log.time}</span>
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{
                                background:
                                    log.type === "verify" ? "var(--accent-green)" :
                                        log.type === "penalty" ? "var(--accent-red)" :
                                            log.type === "upgrade" ? "var(--accent-amber)" :
                                                log.type === "station" ? "var(--accent-blue)" :
                                                    log.type === "incident" ? "#dc2626" :
                                                        "var(--text-muted)"
                            }} />
                            <span>{log.action}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
