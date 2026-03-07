import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/train.api";

const STATUS_CFG = {
    Running: { color: "text-green-400 bg-green-500/10 border-green-500/20", dot: "bg-green-400" },
    Delayed: { color: "text-orange-400 bg-orange-500/10 border-orange-500/20", dot: "bg-orange-400" },
    Departed: { color: "text-blue-400 bg-blue-500/10 border-blue-500/20", dot: "bg-blue-400" },
};

export default function TrainManagement() {
    const [trains, setTrains] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQ, setSearchQ] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const data = await api.searchTrains("Kerala");
                const enriched = data.map(t => {
                    const seed = t.trainNumber.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
                    const status = seed % 5 === 0 ? "Delayed" : seed % 7 === 0 ? "Departed" : "Running";
                    return { ...t, status, totalCoaches: 14 + (seed % 8) };
                });
                setTrains(enriched);
                setFiltered(enriched);
            } catch { }
            setLoading(false);
        })();
    }, []);

    useEffect(() => {
        let res = trains;
        if (searchQ) res = res.filter(t =>
            t.trainName.toLowerCase().includes(searchQ.toLowerCase()) ||
            t.trainNumber.includes(searchQ)
        );
        if (statusFilter !== "all") res = res.filter(t => t.status === statusFilter);
        setFiltered(res);
    }, [searchQ, statusFilter, trains]);

    const counts = {
        Running: trains.filter(t => t.status === "Running").length,
        Delayed: trains.filter(t => t.status === "Delayed").length,
        Departed: trains.filter(t => t.status === "Departed").length,
    };

    return (
        <div className="space-y-5">
            <h1 className="text-2xl md:text-3xl font-black text-white">🚂 Train Management</h1>

            {/* Status filter pills */}
            <div className="flex flex-wrap gap-2">
                {[["all", "All Trains", trains.length, "text-gray-400 bg-white/5 border-white/10"],
                ["Running", "Running", counts.Running, "text-green-400 bg-green-500/8 border-green-500/20"],
                ["Delayed", "Delayed", counts.Delayed, "text-orange-400 bg-orange-500/8 border-orange-500/20"],
                ["Departed", "Departed", counts.Departed, "text-blue-400 bg-blue-500/8 border-blue-500/20"],
                ].map(([val, label, cnt, inactiveCls]) => (
                    <button
                        key={val}
                        onClick={() => setStatusFilter(val)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold border transition ${statusFilter === val
                                ? val === "all" ? "bg-white/15 text-white border-white/20" : inactiveCls.replace("/8", "/20")
                                : `${inactiveCls} opacity-60 hover:opacity-100`
                            }`}
                    >
                        {label} <span className="ml-1 opacity-70">{cnt}</span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <input
                    type="text"
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    placeholder="Search train name or number..."
                    className="w-full bg-[#111827] text-white border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#4ab86d] transition"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-base">🔍</span>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-[#111827] rounded-2xl h-36 animate-pulse border border-white/5" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((t, i) => {
                        const cfg = STATUS_CFG[t.status] || STATUS_CFG.Running;
                        return (
                            <div
                                key={i}
                                onClick={() => navigate(`/admin/train/${t.trainNumber}`)}
                                className="bg-[#111827] border border-white/5 rounded-2xl p-4 cursor-pointer hover:bg-white/3 hover:border-white/10 transition group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center text-blue-400 text-base">🚂</div>
                                    <span className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border font-bold ${cfg.color}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
                                        {t.status}
                                    </span>
                                </div>
                                <div className="font-bold text-white text-sm leading-tight mb-1 group-hover:text-[#4ab86d] transition">{t.trainName}</div>
                                <div className="text-[10px] font-mono text-gray-500 mb-2">#{t.trainNumber}</div>
                                <div className="text-xs text-gray-400 truncate">{t.source} → {t.destination}</div>
                                <div className="mt-3 flex items-center justify-between text-[10px] text-gray-600">
                                    <span>{t.totalCoaches} coaches</span>
                                    <span className="text-[#4ab86d] opacity-0 group-hover:opacity-100 font-bold transition">View Seats →</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="text-center py-16 text-gray-500 text-sm">No trains match your filter.</div>
            )}
        </div>
    );
}
