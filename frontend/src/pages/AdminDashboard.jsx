import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/train.api";
import { supabase } from "../utils/supabaseClient";

function StatCard({ label, value, sub, color = "blue", icon }) {
    const colors = {
        blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
        green: "from-green-500/20 to-green-600/5 border-green-500/20 text-green-400",
        red: "from-red-500/20 to-red-600/5 border-red-500/20 text-red-400",
        orange: "from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400",
        purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400",
    };
    return (
        <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 ${colors[color]}`}>
            <div className="text-3xl mb-2">{icon}</div>
            <div className="text-2xl md:text-3xl font-black text-white">{value}</div>
            <div className="text-sm font-bold mt-0.5">{label}</div>
            {sub && <div className="text-xs opacity-70 mt-1">{sub}</div>}
        </div>
    );
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [trains, setTrains] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [ttes, setTtes] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                // 1. Trains
                const raw = await api.searchTrains("Kerala");
                const enriched = raw.slice(0, 8).map(t => {
                    const seed = t.trainNumber.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
                    return { ...t, status: seed % 5 === 0 ? "Delayed" : seed % 7 === 0 ? "Departed" : "Running" };
                });
                setTrains(enriched);

                // 2. Complaints
                const { data: cd } = await supabase.from("complaints").select("*").order("created_at", { ascending: false }).limit(8);
                if (cd) setComplaints(cd);

                // 3. TTEs
                const { data: td } = await supabase.from("tte_accounts").select("*").limit(5);
                if (td) setTtes(td);

                // 4. Active assignments
                const { data: ad } = await supabase.from("tte_assignments").select("*").eq("status", "active").limit(5);
                if (ad) setAssignments(ad);

            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const running = trains.filter(t => t.status === "Running").length;
    const delayed = trains.filter(t => t.status === "Delayed").length;
    const departed = trains.filter(t => t.status === "Departed").length;

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#4ab86d] border-t-transparent rounded-full animate-spin" />
                Loading dashboard...
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-white">Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1">Live overview · SmartRail Kerala Network</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <StatCard label="Running" value={running} icon="🟢" color="green" sub="Active trains" />
                <StatCard label="Delayed" value={delayed} icon="🟡" color="orange" sub="Behind schedule" />
                <StatCard label="Departed" value={departed} icon="🔵" color="blue" sub="Completed today" />
                <StatCard label="Complaints" value={complaints.length} icon="💬" color="red" sub="Unresolved" />
            </div>

            {/* Main 2-col layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Live Train Status */}
                <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                        <h2 className="font-bold text-white flex items-center gap-2">🚂 Live Train Status</h2>
                        <button onClick={() => navigate("/admin/trains")} className="text-xs text-[#4ab86d] hover:underline font-bold">View all →</button>
                    </div>
                    <div className="divide-y divide-white/5">
                        {trains.slice(0, 6).map((t, i) => (
                            <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-white/2 transition">
                                <div>
                                    <div className="font-bold text-white text-sm">{t.trainName}</div>
                                    <div className="text-xs text-gray-500 font-mono">{t.trainNumber} · {t.source} → {t.destination}</div>
                                </div>
                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${t.status === "Running" ? "text-green-400 bg-green-500/10 border-green-500/20" :
                                        t.status === "Delayed" ? "text-orange-400 bg-orange-500/10 border-orange-500/20" :
                                            "text-blue-400 bg-blue-500/10 border-blue-500/20"
                                    }`}>{t.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Complaints Panel */}
                <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                        <h2 className="font-bold text-white flex items-center gap-2">💬 Recent Complaints</h2>
                        <button onClick={() => navigate("/admin/complaints")} className="text-xs text-[#4ab86d] hover:underline font-bold">View all →</button>
                    </div>
                    {complaints.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">No complaints yet. 🎉</div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {complaints.map((c, i) => (
                                <div key={i} className="px-5 py-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-white truncate">{c.subject || c.category || "Complaint"}</div>
                                            <div className="text-xs text-gray-400 truncate mt-0.5">{c.message || c.description || "—"}</div>
                                        </div>
                                        <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-bold ${c.status === "resolved" ? "text-green-400 bg-green-500/10 border-green-500/20" :
                                                "text-orange-400 bg-orange-500/10 border-orange-500/20"
                                            }`}>{c.status || "open"}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-600 mt-1">{c.user_email || c.email || "Anonymous"} · {c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN") : ""}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Active TTE Assignments */}
                <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                        <h2 className="font-bold text-white flex items-center gap-2">👔 Active TTE Duties</h2>
                        <button onClick={() => navigate("/admin/assignments")} className="text-xs text-[#4ab86d] hover:underline font-bold">Manage →</button>
                    </div>
                    {assignments.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">No active assignments.</div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {assignments.map((a, i) => (
                                <div key={i} className="px-5 py-3 flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-xl bg-[#4ab86d]/15 border border-[#4ab86d]/20 flex items-center justify-center text-[#4ab86d] font-black text-sm shrink-0">
                                        {a.tte_name?.[0] || "T"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-white text-sm">{a.tte_name}</div>
                                        <div className="text-xs text-gray-400">Train {a.train_no} · {a.duty_date}</div>
                                        {a.coach_ids?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {a.coach_ids.slice(0, 4).map(c => (
                                                    <span key={c} className="text-[9px] bg-blue-500/10 text-blue-300 border border-blue-500/15 px-1.5 rounded font-mono">{c}</span>
                                                ))}
                                                {a.coach_ids.length > 4 && <span className="text-[9px] text-gray-500">+{a.coach_ids.length - 4} more</span>}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500">{a.shift_start}–{a.shift_end}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-[#111827] border border-white/5 rounded-2xl p-5">
                    <h2 className="font-bold text-white mb-4 flex items-center gap-2">⚡ Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: "Seat Map", icon: "💺", path: "/admin/seats", color: "#4ab86d" },
                            { label: "Assign TTE", icon: "📋", path: "/admin/assignments", color: "#3b82f6" },
                            { label: "Edit Fares", icon: "💰", path: "/admin/fares", color: "#f59e0b" },
                            { label: "Send Alert", icon: "🔔", path: "/admin/notifications", color: "#8b5cf6" },
                        ].map(a => (
                            <button
                                key={a.path}
                                onClick={() => navigate(a.path)}
                                style={{ borderColor: a.color + "30" }}
                                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/3 hover:bg-white/6 border transition text-center"
                            >
                                <span className="text-2xl">{a.icon}</span>
                                <span className="text-xs font-bold text-gray-300">{a.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
