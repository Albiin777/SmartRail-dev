import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import trainData from "../data/smartRailData.json";
import seatLayoutData from "../data/SmartRailSeatLayoutFull.json";

export default function Results() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    // Parse query params
    const searchMode = searchParams.get("mode") || "route";
    const fromParam = searchParams.get("from") || "";
    const toParam = searchParams.get("to") || "";
    const dateParam = searchParams.get("date") || "";
    const trainQueryParam = searchParams.get("q") || "";
    const classParam = searchParams.get("class") || "General";

    // Helper to extract code from "Name (Code)"
    const extractCode = (str) => {
        const match = str.match(/\(([^)]+)\)$/);
        return match ? match[1] : str;
    };

    const getDayName = (dateStr) => {
        if (!dateStr) return "";
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[new Date(dateStr).getDay()];
    };

    useEffect(() => {
        setLoading(true);
        // Simulate slight delay for "searching" feel
        setTimeout(() => {
            let filtered = [];

            if (searchMode === "train") {
                const q = trainQueryParam.toLowerCase();
                filtered = trainData.filter(t =>
                    (t.trainName && t.trainName.toLowerCase().includes(q)) ||
                    (t.trainNumber && t.trainNumber.includes(q))
                );
            } else {
                // Route Search
                const fromCode = extractCode(fromParam);
                const toCode = extractCode(toParam);

                if (fromCode && toCode) {
                    const seenTrains = new Set();

                    filtered = trainData.filter(t => {
                        // 1. Deduplication
                        if (seenTrains.has(t.trainNumber)) return false;

                        if (!t.schedule) return false;

                        const fromStation = t.schedule.find(s => s.stationCode === fromCode);
                        const toStation = t.schedule.find(s => s.stationCode === toCode);

                        if (fromStation && toStation) {
                            // Check direction (from comes before to)
                            if (t.schedule.indexOf(fromStation) < t.schedule.indexOf(toStation)) {
                                seenTrains.add(t.trainNumber);
                                return true;
                            }
                        }
                        return false;
                    });

                    // 2. Sort by Departure Time (Calculated)
                    filtered.sort((a, b) => {
                        const getDepTime = (train) => {
                            const seed = train.trainNumber.split('').reduce((x, y) => x + y.charCodeAt(0), 0);
                            const startHour = 4 + (seed % 18);
                            const startMin = (seed * 7) % 60;

                            let dist = 0;
                            const f = train.schedule.find(s => s.stationCode === fromCode);
                            if (f) dist = f.distanceFromSourceKm || 0;

                            const avgSpeed = 45 + (seed % 25);
                            const timeToSource = dist / avgSpeed;
                            return (startHour * 60) + startMin + (timeToSource * 60);
                        };
                        return getDepTime(a) - getDepTime(b);
                    });
                }
            }

            setResults(filtered);
            setLoading(false);
        }, 800);
    }, [searchParams]);

    // Real Availability Generator using SmartRailSeatLayoutFull.json
    const getRealAvailability = (trainNo, classCode) => {
        // Find the train in the layout data
        const trainLayout = seatLayoutData.find(t => t.trainNumber === trainNo);

        if (!trainLayout || !trainLayout.coaches) {
            // Fallback if no layout data
            return { status: "AVAILABLE", count: 100, color: "text-green-600" };
        }

        // Filter coaches by class code
        const relevantCoaches = trainLayout.coaches.filter(c => c.classCode === classCode);

        // Sum total seats
        const totalSeats = relevantCoaches.reduce((sum, coach) => sum + (coach.totalSeats || 0), 0);

        if (totalSeats > 0) {
            return { status: "AVAILABLE", count: totalSeats, color: "text-green-600" };
        }

        return { status: "WAITING LIST", count: 50, color: "text-red-600" };
    };

    // Helper to calculate times based on distance
    const calculateTimes = (train, fromCode, toCode) => {
        // 1. Generate deterministic start time based on train number
        const seed = train.trainNumber.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const startHour = 4 + (seed % 18); // Starts between 04:00 and 22:00
        const startMin = (seed * 7) % 60;

        // 2. Schedule logic
        let dist = train.distanceKm || 500; // Total run
        let fromDist = 0;
        let toDist = dist;

        if (train.schedule) {
            const f = train.schedule.find(s => s.stationCode === fromCode);
            const t = train.schedule.find(s => s.stationCode === toCode);
            if (f) fromDist = f.distanceFromSourceKm || 0;
            if (t) toDist = t.distanceFromSourceKm || 0;
        }

        // 3. Calculate travel duration
        // Avg speed varies slightly by train number hash (45-70 km/h)
        const avgSpeed = 45 + (seed % 25);

        // Time to reach Source Station from Origin
        const timeToSource = fromDist / avgSpeed; // hours
        // Time to reach Dest Station from Origin
        const timeToDest = toDist / avgSpeed; // hours

        // Real Departure Time (Origin Start + TimeToSource)
        let depTotalMins = (startHour * 60) + startMin + (timeToSource * 60);
        // Real Arrival Time (Origin Start + TimeToDest)
        let arrTotalMins = (startHour * 60) + startMin + (timeToDest * 60);

        // Format Helper
        const formatTime = (totalMins) => {
            const days = Math.floor(totalMins / (24 * 60));
            const hours = Math.floor((totalMins % (24 * 60)) / 60);
            const mins = Math.floor(totalMins % 60);
            return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        };

        const durationMins = arrTotalMins - depTotalMins;
        const durationStr = `${Math.floor(durationMins / 60)}h ${Math.floor(durationMins % 60)}m`;

        return {
            departure: formatTime(depTotalMins),
            arrival: formatTime(arrTotalMins),
            duration: durationStr,
            distance: Math.floor(toDist - fromDist)
        };
    };

    return (
        <div className="min-h-screen bg-gray-900 pb-10 text-gray-100">
            {/* Search Header - Seamless Dark Theme, No Blue Border */}
            <div className="bg-gray-900 pt-8 pb-32 px-4">
                <div className="max-w-6xl mx-auto">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-6"
                    >
                        ← Back to Search
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 text-white">
                                {searchMode === 'train' ? `Results for "${trainQueryParam}"` : `${fromParam.split('(')[0]} → ${toParam.split('(')[0]}`}
                            </h1>
                            <p className="text-gray-400">
                                {results.length} trains found • {new Date(dateParam).toDateString()}
                            </p>
                        </div>

                        {searchMode === 'route' && (
                            <div className="bg-gray-800 rounded-lg px-4 py-2 text-sm border border-gray-700">
                                <span className="text-gray-400">Class:</span> <span className="font-semibold text-white">{classParam}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Results List */}
            <div className="max-w-6xl mx-auto px-4 -mt-24 relative z-10">
                {loading ? (
                    <div className="bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-700">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-gray-400">Searching for trains...</p>
                    </div>
                ) : results.length === 0 ? (
                    <div className="bg-gray-800 rounded-2xl shadow-xl p-12 text-center border border-gray-700">
                        <h3 className="text-xl font-semibold text-white mb-2">No trains found</h3>
                        <p className="text-gray-400 mb-6">Try modifying your search criteria.</p>
                        <button
                            onClick={() => navigate("/")}
                            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                        >
                            Modify Search
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {results.map((train) => {
                            let times = { departure: "06:00", arrival: "14:00", duration: "8h 00m", distance: 0 };

                            if (searchMode === 'route') {
                                const fromCode = extractCode(fromParam);
                                const toCode = extractCode(toParam);
                                times = calculateTimes(train, fromCode, toCode);
                            }

                            return (
                                <div key={train.trainNumber} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden border border-gray-200 group">
                                    <div className="p-6">
                                        {/* Top Row: Header */}
                                        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-xl font-bold text-gray-900">{train.trainName}</h3>
                                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-mono">#{train.trainNumber}</span>
                                                </div>
                                                <p className="text-sm text-gray-500">{train.type} • Runs: {train.runningDays?.length ? train.runningDays.join(', ') : 'Daily'}</p>
                                            </div>

                                            {/* For Route Search: Times on Light Background */}
                                            {searchMode === 'route' && (
                                                <div className="text-right w-full md:w-auto">
                                                    <div className="flex justify-between md:justify-end items-center gap-6 text-gray-800">
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold">{times.departure}</div>
                                                            <div className="text-xs text-gray-500 font-mono tracking-wider">{extractCode(fromParam)}</div>
                                                        </div>
                                                        <div className="flex flex-col items-center px-4">
                                                            <div className="w-20 h-[2px] bg-gray-300 relative my-1">
                                                                <div className="absolute -top-1 right-0 w-2 h-2 border-t-2 border-r-2 border-gray-300 rotate-45"></div>
                                                            </div>
                                                            <div className="text-xs text-gray-400">{times.duration}</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold">{times.arrival}</div>
                                                            <div className="text-xs text-gray-500 font-mono tracking-wider">{extractCode(toParam)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Classes & Availability - SCROLLABLE ON MOBILE */}
                                        <div className="flex overflow-x-auto pb-4 gap-3 -mx-2 px-2 md:grid md:grid-cols-4 lg:grid-cols-6 md:pb-0 md:overflow-visible custom-scrollbar">
                                            {["SL", "3A", "2A", "1A"].map(cls => {
                                                const avail = getRealAvailability(train.trainNumber, cls);
                                                return (
                                                    <div key={cls} className={`flex-shrink-0 w-32 md:w-auto rounded-xl border border-gray-300 bg-gray-200 p-3 flex flex-col justify-between cursor-pointer hover:border-orange-500/50 hover:bg-orange-100 transition relative overflow-hidden group/card`}>
                                                        <div className="flex justify-between items-center mb-3 z-10">
                                                            <span className="font-bold text-sm text-gray-800">{cls}</span>
                                                            <span className="text-xs text-gray-600 font-medium">₹ {train.baseFares?.[cls] || 500}</span>
                                                        </div>
                                                        <div className={`text-sm font-bold ${avail.color} z-10`}>
                                                            {avail.status} <span className="text-xs opacity-75 text-gray-700">({avail.count})</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
                                        <button className="text-sm text-gray-500 hover:text-gray-900 font-medium transition">View Route</button>
                                        <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-2.5 rounded-lg font-semibold text-sm transition shadow-lg shadow-orange-900/20 active:scale-95">
                                            Book Ticket
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
