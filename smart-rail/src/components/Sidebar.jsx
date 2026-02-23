import { NavLink, useLocation } from "react-router-dom";
import { useSmartRail } from "../hooks/useSmartRail";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiHome, FiSearch, FiAlertTriangle, FiArrowUpCircle,
    FiFileText, FiUser, FiMapPin, FiStar, FiMessageCircle,
    FiMap, FiBell, FiHeadphones, FiShield, FiGrid, FiRefreshCw,
    FiChevronLeft, FiChevronRight, FiLogOut
} from "react-icons/fi";

const navItems = [
    { to: "/", label: "Dashboard", icon: FiHome },
    { to: "/inspection", label: "Inspection", icon: FiSearch },
    { to: "/penalties", label: "Penalties", icon: FiAlertTriangle },
    { to: "/rac-upgrades", label: "RAC Upgrades", icon: FiArrowUpCircle },
    { to: "/train-directory", label: "Train Directory", icon: FiMap },
    { to: "/reviews", label: "Reviews", icon: FiStar },
    { to: "/complaints", label: "Complaints", icon: FiMessageCircle },
    { to: "/notifications", label: "Notifications", icon: FiBell, hasBadge: true },
    { to: "/support", label: "Support", icon: FiHeadphones },
    { to: "/incidents", label: "Incidents", icon: FiShield },
    { to: "/seat-management", label: "Seat Mgmt", icon: FiGrid },
    { to: "/handover", label: "TT Handover", icon: FiRefreshCw },
    { to: "/reports", label: "Reports", icon: FiFileText },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
    const { ttInfo, stations, stationIndex, time, unreadNotifications } = useSmartRail();
    const location = useLocation();

    const handleNavClick = () => {
        // Close mobile sidebar on navigation
        if (mobileOpen && onMobileClose) onMobileClose();
    };

    return (
        <>
            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="sidebar-overlay"
                        onClick={onMobileClose}
                    />
                )}
            </AnimatePresence>

            <aside
                className={`sidebar ${collapsed ? "sidebar-collapsed" : ""} ${mobileOpen ? "sidebar-mobile-open" : ""}`}
            >
                {/* Logo / Brand */}
                <div className="sidebar-header">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0"
                            style={{ background: "rgba(255,255,255,0.1)" }}
                        >
                            🚆
                        </div>
                        {!collapsed && (
                            <div className="sidebar-text">
                                <h1 className="text-sm font-bold tracking-tight text-white">SmartRail</h1>
                                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>TT Enterprise System</p>
                            </div>
                        )}
                    </div>
                    {/* Desktop collapse toggle */}
                    <button
                        onClick={onToggle}
                        className="sidebar-toggle-btn desktop-only"
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navItems.map(item => {
                        const isActive = location.pathname === item.to;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={handleNavClick}
                                className={`sidebar-link ${isActive ? "active" : ""} ${collapsed ? "collapsed" : ""}`}
                                title={collapsed ? item.label : undefined}
                            >
                                <item.icon size={16} className="shrink-0" />
                                {!collapsed && <span className="sidebar-text flex-1">{item.label}</span>}
                                {item.hasBadge && unreadNotifications > 0 && (
                                    <span className="sidebar-badge">
                                        {collapsed ? "" : unreadNotifications}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Station Progress Mini */}
                {!collapsed && (
                    <div className="sidebar-footer-section">
                        <div className="flex items-center gap-2 mb-2">
                            <FiMapPin size={12} style={{ color: "#4ade80" }} />
                            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>Current Station</span>
                        </div>
                        <div className="text-sm font-semibold" style={{ color: "#4ade80" }}>
                            {stations[stationIndex]}
                        </div>
                        <div className="flex gap-1 mt-2">
                            {stations.map((s, i) => (
                                <div
                                    key={s}
                                    className="h-1 flex-1 rounded-full"
                                    style={{
                                        background: i <= stationIndex ? "#4ade80" : "rgba(255,255,255,0.1)"
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* TT Officer Info */}
                <div className="sidebar-footer-section">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.12)" }}>
                            <FiUser size={14} className="text-white" />
                        </div>
                        {!collapsed && (
                            <div className="sidebar-text">
                                <p className="text-[13px] font-medium text-white">{ttInfo.ttName}</p>
                                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>{ttInfo.employeeId} • {ttInfo.coach}</p>
                            </div>
                        )}
                    </div>
                    {!collapsed && (
                        <div className="mt-2 flex items-center gap-2">
                            <div className="pulse-dot" />
                            <span className="text-[11px]" style={{ color: "#4ade80" }}>
                                Online • {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </span>
                        </div>
                    )}

                    {/* Logout Button */}
                    <button
                        onClick={async () => {
                            await import("../supabaseClient").then(({ supabase }) => supabase.auth.signOut());
                            window.location.href = "/login";
                        }}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                        {collapsed ? <FiLogOut size={16} /> : (
                            <>
                                <FiLogOut size={14} />
                                <span>Logout</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}
