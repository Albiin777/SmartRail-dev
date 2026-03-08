import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

const NAV = [
    { path: "/admin", label: "Dashboard", icon: "⬛", emoji: "📊", exact: true },
    { path: "/admin/trains", label: "Trains", icon: "🚂", emoji: "🚂" },
    { path: "/admin/seats", label: "Seat Management", icon: "💺", emoji: "💺" },
    { path: "/admin/ttes", label: "TTE Staff", icon: "👔", emoji: "👔" },
    { path: "/admin/assignments", label: "TTE Assign", icon: "📋", emoji: "📋" },
    { path: "/admin/fares", label: "Fare Editor", icon: "💰", emoji: "💰" },
    { path: "/admin/complaints", label: "Complaints", icon: "💬", emoji: "💬" },
    { path: "/admin/notifications", label: "Notifications", icon: "🔔", emoji: "🔔" },
    { path: "/admin/reports", label: "Reports", icon: "📈", emoji: "📈" },
];

export default function AdminLayout() {
    const navigate = useNavigate();
    const [sideOpen, setSideOpen] = useState(false);
    const adminEmail = "admin@gmail.com";

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem("isAdmin");
        navigate("/");
    };

    return (
        <div className="min-h-screen flex bg-[#080f1e] text-gray-100 font-sans">

            {/* Overlay for mobile */}
            {sideOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={() => setSideOpen(false)}
                />
            )}

            {/* ── Sidebar ───────────────────────────────────────────── */}
            <aside className={`
        fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-[#0d1526] border-r border-white/5
        transform transition-transform duration-300 ease-in-out
        ${sideOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:inset-auto
      `}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
                    <img src="/trainnew.png" alt="SmartRail Logo" className="h-9 w-auto object-contain drop-shadow-lg" />
                    <div>
                        <div className="text-white font-black text-sm tracking-wide">SmartRail</div>
                        <div className="text-[#4ab86d] text-[10px] font-bold uppercase tracking-widest">Admin Panel</div>
                    </div>
                    <button className="ml-auto md:hidden text-gray-500 hover:text-white" onClick={() => setSideOpen(false)}>✕</button>
                </div>

                {/* Admin info */}
                <div className="px-5 py-3 border-b border-white/5">
                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-0.5">Signed in as</div>
                    <div className="text-white text-sm font-mono truncate">{adminEmail}</div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {NAV.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            onClick={() => setSideOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                                    ? "bg-[#4ab86d]/15 text-[#4ab86d] border border-[#4ab86d]/20 shadow-sm"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`
                            }
                        >
                            <span className="text-base w-5 text-center">{item.emoji}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/8 hover:bg-red-500/15 text-red-400 border border-red-500/15 font-bold text-sm transition-all"
                    >
                        ⏻ Logout
                    </button>
                </div>
            </aside>

            {/* ── Main area ─────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen">

                {/* Top bar (mobile) */}
                <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-[#0d1526] border-b border-white/5 md:hidden">
                    <button
                        onClick={() => setSideOpen(true)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#1D2332] text-gray-300 hover:text-white border border-white/5"
                    >
                        ☰
                    </button>
                    <div className="flex items-center gap-2">
                        <img src="/trainnew.png" alt="SmartRail Logo" className="h-7 w-auto object-contain drop-shadow-md" />
                        <span className="text-white font-bold text-sm">Admin Portal</span>
                    </div>
                </header>

                {/* Desktop top bar */}
                <header className="hidden md:flex items-center justify-between px-8 py-4 bg-[#0d1526] border-b border-white/5 sticky top-0 z-20">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="text-[#4ab86d] font-bold">SmartRail</span>
                        <span>/</span>
                        <span>Admin Portal</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-500 font-mono">{adminEmail}</div>
                        <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition font-bold">⏻ Logout</button>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-x-hidden">
                    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
