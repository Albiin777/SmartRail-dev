import { useState, useEffect } from "react";
import api from "../../api/train.api";
import { supabase } from "../../utils/supabaseClient";

const today = new Date().toISOString().split("T")[0];

function addDays(base, n) {
    const d = new Date(base);
    d.setDate(d.getDate() + n);
    return d.toISOString().split("T")[0];
}

// Build 30-day date list from today
const DATES = Array.from({ length: 30 }, (_, i) => addDays(today, i));

export default function SeatManagement() {
    const [step, setStep] = useState(1); // 1=train, 2=date, 3=coach, 4=seats
    const [searchQ, setSearchQ] = useState("");
    const [trains, setTrains] = useState([]);
    const [trainLoading, setTrainLoading] = useState(false);
    const [selectedTrain, setSelectedTrain] = useState(null);
    const [selectedDate, setSelectedDate] = useState(today);
    const [layoutData, setLayoutData] = useState(null);
    const [selectedCoach, setSelectedCoach] = useState(null);
    const [passengerMap, setPassengerMap] = useState({});
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [layoutLoading, setLayoutLoading] = useState(false);

    // Search trains
    useEffect(() => {
        if (searchQ.length < 1) { setTrains([]); return; }
        const t = setTimeout(async () => {
            setTrainLoading(true);
            try {
                const res = await api.searchTrains(searchQ);
                setTrains(res.slice(0, 20));
            } catch { setTrains([]); }
            setTrainLoading(false);
        }, 350);
        return () => clearTimeout(t);
    }, [searchQ]);

    // Load seat layout + passengers when reaching step 3
    useEffect(() => {
        if (step < 3 || !selectedTrain) return;
        (async () => {
            setLayoutLoading(true);
            try {
                const layout = await api.getSeatLayout(selectedTrain.trainNumber);
                if (layout?.coaches) {
                    setLayoutData(layout);
                    setSelectedCoach(layout.coaches[0]?.coachId || null);
                }
                // Load passengers for this train+date
                const { data } = await supabase
                    .from("passenger_details")
                    .select("*")
                    .eq("train_no", selectedTrain.trainNumber)
                    .eq("date", selectedDate);
                const pm = {};
                (data || []).forEach(p => { pm[`${p.coach}-${p.seat_number}`] = p; });
                setPassengerMap(pm);
            } catch { }
            setLayoutLoading(false);
        })();
    }, [step, selectedTrain, selectedDate]);

    const coach = layoutData?.coaches?.find(c => c.coachId === selectedCoach);
    const totalSeats = coach?.seats?.length || 0;
    const bookedSeats = coach?.seats?.filter(s => passengerMap[`${selectedCoach}-${s.seatNumber}`]).length || 0;
    const available = totalSeats - bookedSeats;

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black text-white">💺 Seat Management</h1>
            </div>

            {/* Breadcrumb / Steps */}
            <div className="flex items-center gap-2 text-sm overflow-x-auto pb-1">
                {["Select Train", "Select Date", "View Layout"].map((s, i) => (
                    <div key={i} className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => step > i + 1 && setStep(i + 1)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs transition ${step === i + 1 ? "bg-[#4ab86d] text-black" :
                                    step > i + 1 ? "bg-[#4ab86d]/20 text-[#4ab86d] cursor-pointer hover:bg-[#4ab86d]/30" :
                                        "bg-white/5 text-gray-500"
                                }`}
                        >
                            <span>{i + 1}</span> <span>{s}</span>
                        </button>
                        {i < 2 && <span className="text-gray-600">›</span>}
                    </div>
                ))}
            </div>

            {/* STEP 1 — Train Selection */}
            {step === 1 && (
                <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/5">
                        <input
                            type="text"
                            placeholder="Search train name or number (e.g. Jan Shatabdi, 12082)..."
                            value={searchQ}
                            onChange={e => setSearchQ(e.target.value)}
                            className="w-full bg-[#080f1e] text-white border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4ab86d] transition"
                        />
                    </div>
                    {trainLoading && <div className="p-6 text-center text-gray-500 text-sm">Searching...</div>}
                    {!trainLoading && trains.length === 0 && searchQ.length >= 1 && (
                        <div className="p-6 text-center text-gray-500 text-sm">No trains found for "{searchQ}"</div>
                    )}
                    {!trainLoading && trains.length === 0 && searchQ.length === 0 && (
                        <div className="p-8 text-center text-gray-600 text-sm">Type train name or number to search all 198 trains.</div>
                    )}
                    <div className="divide-y divide-white/5">
                        {trains.map((t, i) => (
                            <button
                                key={i}
                                onClick={() => { setSelectedTrain(t); setStep(2); }}
                                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/3 text-left transition group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-xs shrink-0">
                                    🚂
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-white">{t.trainName}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        <span className="font-mono text-blue-400">{t.trainNumber}</span>
                                        <span className="mx-2">·</span>
                                        <span>{t.source}</span>
                                        <span className="mx-1 text-gray-600">→</span>
                                        <span>{t.destination}</span>
                                    </div>
                                </div>
                                <span className="text-gray-600 group-hover:text-[#4ab86d] font-bold transition">›</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 2 — Date Selection */}
            {step === 2 && selectedTrain && (
                <div className="space-y-4">
                    <div className="bg-[#111827] border border-white/5 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-2xl">🚂</span>
                            <div>
                                <div className="font-black text-white text-lg">{selectedTrain.trainName}</div>
                                <div className="text-xs text-gray-400 font-mono">{selectedTrain.trainNumber} · {selectedTrain.source} → {selectedTrain.destination}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#111827] border border-white/5 rounded-2xl p-5">
                        <h3 className="font-bold text-white mb-4">Select Journey Date</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
                            {DATES.map(d => {
                                const dt = new Date(d);
                                const isSel = d === selectedDate;
                                return (
                                    <button
                                        key={d}
                                        onClick={() => setSelectedDate(d)}
                                        className={`flex flex-col items-center py-3 px-2 rounded-xl border font-bold transition text-center ${isSel
                                                ? "bg-[#4ab86d] text-black border-[#4ab86d]"
                                                : "bg-white/3 text-gray-300 border-white/5 hover:bg-white/8"
                                            }`}
                                    >
                                        <span className="text-[10px] uppercase tracking-wide opacity-70">
                                            {dt.toLocaleDateString("en-IN", { weekday: "short" })}
                                        </span>
                                        <span className="text-base font-black">{dt.getDate()}</span>
                                        <span className="text-[9px] opacity-60">{dt.toLocaleDateString("en-IN", { month: "short" })}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setStep(3)}
                            className="mt-5 w-full bg-[#4ab86d] hover:bg-[#3da85c] text-black font-black py-3 rounded-xl transition"
                        >
                            View Seat Layout for {new Date(selectedDate).toLocaleDateString("en-IN", { dateStyle: "long" })}
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3 — Layout + Seat View */}
            {step === 3 && selectedTrain && (
                <div className="space-y-4">
                    {/* Train + Date header */}
                    <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1">
                            <div className="font-black text-white">{selectedTrain.trainName}</div>
                            <div className="text-xs text-gray-400 font-mono mt-0.5">
                                {selectedTrain.trainNumber} · {new Date(selectedDate).toLocaleDateString("en-IN", { dateStyle: "long" })}
                            </div>
                        </div>
                        <div className="flex gap-2 text-xs">
                            <span className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 font-bold">{available} Available</span>
                            <span className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-bold">{bookedSeats} Booked</span>
                        </div>
                    </div>

                    {layoutLoading ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="w-8 h-8 border-2 border-[#4ab86d] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            Loading seat layout...
                        </div>
                    ) : layoutData ? (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                            {/* Coach Selector */}
                            <div className="bg-[#111827] border border-white/5 rounded-2xl p-4">
                                <h3 className="font-bold text-white text-sm mb-3">Coaches</h3>
                                <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
                                    {layoutData.coaches.map(c => {
                                        const cBooked = c.seats.filter(s => passengerMap[`${c.coachId}-${s.seatNumber}`]).length;
                                        return (
                                            <button
                                                key={c.coachId}
                                                onClick={() => setSelectedCoach(c.coachId)}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition ${selectedCoach === c.coachId
                                                        ? "bg-[#4ab86d]/20 text-[#4ab86d] border border-[#4ab86d]/30"
                                                        : "bg-white/3 text-gray-300 border border-white/5 hover:bg-white/6"
                                                    }`}
                                            >
                                                <span>{c.coachId}</span>
                                                <div className="flex gap-1 items-center text-[10px]">
                                                    <span className="text-green-400">{c.seats.length - cBooked}✓</span>
                                                    <span className="text-gray-600">·</span>
                                                    <span className="text-red-400">{cBooked}✗</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Seat Grid */}
                            <div className="lg:col-span-3 bg-[#111827] border border-white/5 rounded-2xl p-4">
                                {coach && (
                                    <>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-white">Coach {selectedCoach} <span className="text-xs text-gray-500 font-normal ml-2">{coach.classCode} · {totalSeats} total seats</span></h3>
                                            <div className="flex gap-3 text-xs">
                                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-green-500/50 bg-green-500/10 inline-block" />Available</span>
                                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-red-900/50 bg-[#4a2222] inline-block" />Booked</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-[55vh] overflow-y-auto pr-1">
                                            {coach.seats.map(seat => {
                                                const key = `${selectedCoach}-${seat.seatNumber}`;
                                                const passenger = passengerMap[key];
                                                const isBooked = !!passenger;
                                                return (
                                                    <button
                                                        key={seat.seatNumber}
                                                        onClick={() => isBooked && setSelectedSeat(passenger)}
                                                        className={`relative flex flex-col items-center justify-center h-12 w-full rounded-lg border text-xs font-bold transition ${isBooked
                                                                ? "bg-[#4a2222] border-red-900/50 text-red-400 hover:border-red-500/60 cursor-pointer"
                                                                : "bg-transparent border-green-500/30 text-green-400 cursor-default"
                                                            }`}
                                                    >
                                                        <span>{seat.seatNumber}</span>
                                                        <span className="text-[9px] opacity-60">{seat.berthType}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-500">Failed to load layout data.</div>
                    )}
                </div>
            )}

            {/* Passenger Detail Modal */}
            {selectedSeat && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setSelectedSeat(null)}>
                    <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-white text-lg">Passenger Details</h3>
                            <button onClick={() => setSelectedSeat(null)} className="text-gray-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg bg-white/5">✕</button>
                        </div>
                        <div className="space-y-3">
                            {[
                                ["Name", selectedSeat.passenger_name],
                                ["Age", selectedSeat.passenger_age],
                                ["Gender", selectedSeat.passenger_gender],
                                ["Coach", selectedSeat.coach],
                                ["Seat No.", selectedSeat.seat_number],
                                ["Berth", selectedSeat.berth_type],
                                ["PNR", selectedSeat.pnr_number],
                                ["Status", selectedSeat.booking_status],
                            ].map(([k, v]) => (
                                <div key={k} className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">{k}</span>
                                    <span className="text-sm font-bold text-white">{v || "—"}</span>
                                </div>
                            ))}
                        </div>
                        {/* QR */}
                        <div className="mt-4 flex justify-center">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=PNR:${selectedSeat.pnr_number}|${selectedSeat.passenger_name}|${selectedSeat.train_no}|${selectedSeat.coach}-${selectedSeat.seat_number}`}
                                alt="QR"
                                className="rounded-xl border border-white/10"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
