import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";

export default function AdminNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ title: "", message: "", type: "info", target: "all" });
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => { fetchNotifications(); }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);
        if (data) setNotifications(data);
        setLoading(false);
    };

    const sendNotification = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.message.trim()) return;
        setSending(true);
        const { error } = await supabase.from("notifications").insert({
            title: form.title,
            message: form.message,
            type: form.type,
            target_audience: form.target,
            sent_by: "admin",
        });
        if (!error) {
            setSuccess(true);
            setForm({ title: "", message: "", type: "info", target: "all" });
            fetchNotifications();
            setTimeout(() => setSuccess(false), 3000);
        }
        setSending(false);
    };

    const deleteNotification = async (id) => {
        await supabase.from("notifications").delete().eq("id", id);
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const TYPE_STYLES = {
        info: "border-blue-500/20 text-blue-400 bg-blue-500/8",
        warning: "border-orange-500/20 text-orange-400 bg-orange-500/8",
        alert: "border-red-500/20 text-red-400 bg-red-500/8",
        success: "border-green-500/20 text-green-400 bg-green-500/8",
    };
    const TYPE_ICONS = { info: "ℹ️", warning: "⚠️", alert: "🚨", success: "✅" };

    return (
        <div className="space-y-5">
            <h1 className="text-2xl md:text-3xl font-black text-white">🔔 Notifications</h1>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Compose Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={sendNotification} className="bg-[#111827] border border-white/5 rounded-2xl p-5 space-y-4 sticky top-4">
                        <h2 className="font-bold text-white">Send Notification</h2>

                        {success && (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-bold rounded-xl px-4 py-2.5">
                                ✓ Notification sent!
                            </div>
                        )}

                        <div>
                            <label className="text-xs text-gray-500 font-bold uppercase tracking-wide block mb-1.5">Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {["info", "warning", "alert", "success"].map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, type: t }))}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold transition ${form.type === t ? TYPE_STYLES[t] : "bg-white/3 border-white/5 text-gray-400 hover:bg-white/8"
                                            }`}
                                    >
                                        <span>{TYPE_ICONS[t]}</span>
                                        <span className="capitalize">{t}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 font-bold uppercase tracking-wide block mb-1.5">Target Audience</label>
                            <select
                                value={form.target}
                                onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                                className="w-full bg-[#080f1e] text-white border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#4ab86d] transition"
                            >
                                <option value="all">All Users</option>
                                <option value="passengers">Passengers</option>
                                <option value="ttes">TTEs only</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 font-bold uppercase tracking-wide block mb-1.5">Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="e.g. Service Disruption on Route CLT-SRR"
                                className="w-full bg-[#080f1e] text-white border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#4ab86d] transition"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 font-bold uppercase tracking-wide block mb-1.5">Message</label>
                            <textarea
                                value={form.message}
                                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                placeholder="Write the notification message..."
                                rows={4}
                                className="w-full bg-[#080f1e] text-white border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#4ab86d] transition resize-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full bg-[#4ab86d] hover:bg-[#3da85c] disabled:opacity-50 text-black font-black py-3 rounded-xl transition flex items-center justify-center gap-2"
                        >
                            {sending ? "Sending..." : "🔔 Send Notification"}
                        </button>
                    </form>
                </div>

                {/* Sent History */}
                <div className="lg:col-span-3 bg-[#111827] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/5">
                        <h2 className="font-bold text-white">Sent Notifications <span className="text-xs text-gray-500 font-normal ml-2">({notifications.length})</span></h2>
                    </div>
                    {loading ? (
                        <div className="p-10 text-center text-gray-500 text-sm">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-10 text-center text-gray-500 text-sm">No notifications sent yet.</div>
                    ) : (
                        <div className="divide-y divide-white/5 max-h-[75vh] overflow-y-auto">
                            {notifications.map(n => (
                                <div key={n.id} className={`flex gap-4 px-5 py-4 border-l-2 ${n.type === "alert" ? "border-red-500" :
                                        n.type === "warning" ? "border-orange-500" :
                                            n.type === "success" ? "border-green-500" : "border-blue-500"
                                    }`}>
                                    <span className="text-xl shrink-0">{TYPE_ICONS[n.type] || "ℹ️"}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-white text-sm">{n.title}</div>
                                        <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.message}</div>
                                        <div className="flex gap-3 text-[10px] text-gray-600 mt-1.5">
                                            <span>→ {n.target_audience}</span>
                                            <span>·</span>
                                            <span>{n.created_at ? new Date(n.created_at).toLocaleDateString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : ""}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteNotification(n.id)}
                                        className="text-gray-600 hover:text-red-400 transition text-sm shrink-0 self-start mt-1"
                                        title="Delete"
                                    >
                                        🗑
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
