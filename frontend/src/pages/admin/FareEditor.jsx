import { useState, useEffect } from "react";
import api from "../../api/train.api";
import { supabase } from "../../utils/supabaseClient";

export default function FareEditor() {
    const [searchQ, setSearchQ] = useState("");
    const [trains, setTrains] = useState([]);
    const [selectedTrain, setSelectedTrain] = useState(null);
    const [fares, setFares] = useState(null);
    const [editedFares, setEditedFares] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (searchQ.length < 1) { setTrains([]); return; }
        const t = setTimeout(async () => {
            const res = await api.searchTrains(searchQ);
            setTrains(res.slice(0, 12));
        }, 300);
        return () => clearTimeout(t);
    }, [searchQ]);

    const selectTrain = async (train) => {
        setSelectedTrain(train);
        setSearchQ(train.trainName);
        setTrains([]);
        setLoading(true);
        setSuccess(false);
        try {
            // First check if we have overridden fare in supabase
            const { data: override } = await supabase
                .from("fare_overrides")
                .select("*")
                .eq("train_no", train.trainNumber)
                .single();

            // Also get the official fares from API
            const apiFares = await api.getFare(train.trainNumber);
            const baseFares = apiFares?.fares || {};

            if (override) {
                const merged = { ...baseFares, ...override.fares };
                setFares(merged);
                setEditedFares(merged);
            } else {
                setFares(baseFares);
                setEditedFares(baseFares);
            }
        } catch {
            // Fallback fares if API fails
            const fallback = { "2S": 85, "CC": 255, "SL": 195, "3A": 485, "2A": 710, "1A": 1175 };
            setFares(fallback);
            setEditedFares(fallback);
        }
        setLoading(false);
    };

    const saveFares = async () => {
        if (!selectedTrain) return;
        setSaving(true);
        // Upsert into fare_overrides table
        const { error } = await supabase.from("fare_overrides").upsert({
            train_no: selectedTrain.trainNumber,
            train_name: selectedTrain.trainName,
            fares: editedFares,
            updated_at: new Date().toISOString(),
            updated_by: "admin",
        }, { onConflict: "train_no" });
        if (!error) {
            setFares({ ...editedFares });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }
        setSaving(false);
    };

    const CLASS_LABELS = {
        "1A": "AC First Class (1A)",
        "2A": "AC 2-Tier (2A)",
        "3A": "AC 3-Tier (3A)",
        "CC": "AC Chair Car (CC)",
        "SL": "Sleeper (SL)",
        "2S": "2nd Seating (2S)",
        "FC": "First Class (FC)",
        "EC": "Executive Chair (EC)",
        "GS": "General / Unreserved",
    };

    const hasChanges = JSON.stringify(fares) !== JSON.stringify(editedFares);

    return (
        <div className="space-y-5">
            <h1 className="text-2xl md:text-3xl font-black text-white">💰 Fare Editor</h1>
            <p className="text-sm text-gray-400">Set per-train fare overrides. These prices apply to all new bookings for the selected train.</p>

            {/* Train Search */}
            <div className="bg-[#111827] border border-white/5 rounded-2xl p-5">
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wide block mb-2">Select Train</label>
                <div className="relative">
                    <input
                        type="text"
                        value={searchQ}
                        onChange={e => setSearchQ(e.target.value)}
                        placeholder="Search train name or number..."
                        className="w-full bg-[#080f1e] text-white border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4ab86d] transition"
                    />
                    {trains.length > 0 && (
                        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-[#1D2332] border border-gray-700 rounded-xl shadow-2xl max-h-56 overflow-y-auto">
                            {trains.map(t => (
                                <button
                                    key={t.trainNumber}
                                    onClick={() => selectTrain(t)}
                                    className="w-full text-left px-4 py-3 hover:bg-white/5 text-sm border-b border-white/5 flex items-center gap-3"
                                >
                                    <span className="text-xl">🚂</span>
                                    <div>
                                        <div className="font-bold text-white">{t.trainName}</div>
                                        <div className="text-xs text-gray-500">{t.trainNumber} · {t.source} → {t.destination}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Fare Table */}
            {selectedTrain && (
                <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h2 className="font-bold text-white">{selectedTrain.trainName}</h2>
                            <div className="text-xs text-gray-500 font-mono">{selectedTrain.trainNumber} · {selectedTrain.source} → {selectedTrain.destination}</div>
                        </div>
                        {success && <span className="text-green-400 text-sm font-bold">✓ Fares saved!</span>}
                        {hasChanges && !success && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-orange-400 font-bold">Unsaved changes</span>
                                <button onClick={() => setEditedFares({ ...fares })} className="text-xs text-gray-500 hover:text-white border border-gray-700 px-3 py-1.5 rounded-lg transition">Reset</button>
                                <button
                                    onClick={saveFares}
                                    disabled={saving}
                                    className="bg-[#4ab86d] hover:bg-[#3da85c] disabled:opacity-50 text-black font-black px-4 py-1.5 rounded-lg text-sm transition"
                                >
                                    {saving ? "Saving..." : "Save Fares"}
                                </button>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="p-10 text-center text-gray-500">Loading fares...</div>
                    ) : (
                        <div className="p-5">
                            <div className="bg-[#080f1e] border border-white/5 rounded-xl p-4 mb-4 text-xs text-blue-400 flex gap-2">
                                <span>ℹ️</span>
                                <span>These are base fares for the full route. Passengers pay proportional amounts based on their boarding and deboarding stations.</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.keys(editedFares).map(classCode => (
                                    <div key={classCode} className="bg-[#080f1e] border border-white/5 rounded-xl p-4">
                                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">{classCode}</div>
                                        <div className="text-xs text-gray-600 mb-3">{CLASS_LABELS[classCode] || classCode}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-400 font-black text-lg">₹</span>
                                            <input
                                                type="number"
                                                value={editedFares[classCode]}
                                                min={0}
                                                step={5}
                                                onChange={e => setEditedFares(prev => ({ ...prev, [classCode]: Number(e.target.value) }))}
                                                className="w-full bg-[#111827] text-white border border-gray-700 focus:border-[#4ab86d] rounded-lg px-3 py-2 text-lg font-black focus:outline-none transition"
                                            />
                                        </div>
                                        {fares?.[classCode] !== editedFares[classCode] && (
                                            <div className="text-[10px] mt-1.5 flex gap-1.5 items-center">
                                                <span className="text-gray-500 line-through">₹{fares[classCode]}</span>
                                                <span className={`font-bold ${editedFares[classCode] > fares[classCode] ? "text-red-400" : "text-green-400"}`}>
                                                    {editedFares[classCode] > fares[classCode] ? "↑" : "↓"} {Math.abs(((editedFares[classCode] - fares[classCode]) / fares[classCode]) * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {hasChanges && (
                                <div className="mt-5 flex gap-3 justify-end">
                                    <button onClick={() => setEditedFares({ ...fares })} className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white font-bold transition text-sm">Reset Changes</button>
                                    <button onClick={saveFares} disabled={saving}
                                        className="px-6 py-2.5 rounded-xl bg-[#4ab86d] hover:bg-[#3da85c] disabled:opacity-50 text-black font-black transition text-sm">
                                        {saving ? "Saving..." : "💾 Save Fare Overrides"}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {!selectedTrain && !loading && (
                <div className="text-center py-16 text-gray-600 text-sm">Search and select a train above to edit its fares.</div>
            )}
        </div>
    );
}
