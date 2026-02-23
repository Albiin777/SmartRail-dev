import { useState, useEffect } from "react";

const initialPassengers = [
    {
        id: 1,
        coach: "S3",
        name: "Rahul Sharma",
        seat: 1,
        status: "CNF",
        verified: false
    },
    {
        id: 2,
        coach: "S3",
        name: "Priya Singh",
        seat: 2,
        status: "CNF",
        verified: false
    },
    {
        id: 3,
        coach: "S3",
        name: "RAC Passenger",
        seat: null,
        status: "RAC",
        verified: false
    }
];

export default function TTPage() {

    const [passengers, setPassengers] = useState(initialPassengers);
    const [selected, setSelected] = useState(null);
    const [stationIndex, setStationIndex] = useState(0);
    const [logs, setLogs] = useState([]);
    const [time, setTime] = useState(new Date());

    const stations = ["MAS", "NLR", "BZA", "NGP", "NDLS"];

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const verifyPassenger = (id) => {
        setPassengers(prev =>
            prev.map(p =>
                p.id === id ? { ...p, verified: true } : p
            )
        );
        setLogs(prev => [...prev, `Verified ID ${id}`]);
    };

    const markNoShow = (id) => {
        setPassengers(prev => prev.filter(p => p.id !== id));
        setLogs(prev => [...prev, `No Show ID ${id}`]);
    };

    const nextStation = () => {
        if (stationIndex < stations.length - 1) {
            setStationIndex(stationIndex + 1);
            setLogs(prev => [...prev, `Arrived ${stations[stationIndex + 1]}`]);
        }
    };

    const getSeatColor = (seat) => {
        const p = passengers.find(x => x.seat === seat);
        if (!p) return "bg-[#2a2a2a]";
        if (p.verified) return "bg-[#1e3f2b]";
        if (p.status === "RAC") return "bg-[#5a4b1a]";
        return "bg-[#4a1f1f]";
    };

    return (
        <div className="min-h-screen bg-[#121212] text-gray-200 text-[11px] font-mono">

            {/* TOP STATUS BAR */}
            <div className="flex justify-between px-4 py-2 border-b border-gray-700 bg-[#181818]">

                <div>
                    12627 TN EXP | Coach S3
                </div>

                <div>
                    {stations[stationIndex]} | {time.toLocaleTimeString()}
                    <button
                        onClick={nextStation}
                        className="ml-3 px-2 border border-gray-600 bg-[#222]"
                    >
            >>
                    </button>
                </div>

            </div>

            {/* MAIN BODY */}
            <div className="flex h-[calc(100vh-80px)]">

                {/* SEAT GRID */}
                <div className="w-2/3 p-4 border-r border-gray-700 overflow-auto">

                    <div className="grid grid-cols-6 gap-1">

                        {Array.from({ length: 40 }, (_, i) => i + 1).map(seat => (
                            <div
                                key={seat}
                                onClick={() =>
                                    setSelected(passengers.find(p => p.seat === seat))
                                }
                                className={`${getSeatColor(seat)} h-8 flex items-center justify-center border border-[#333] cursor-pointer`}
                            >
                                {seat}
                            </div>
                        ))}

                    </div>

                </div>

                {/* INSPECTION PANEL */}
                <div className="w-1/3 p-4">

                    {selected ? (
                        <div className="space-y-2">

                            <div className="border-b border-gray-700 pb-1">
                                PASSENGER DATA
                            </div>

                            <div>ID: {selected.id}</div>
                            <div>Name: {selected.name}</div>
                            <div>Seat: {selected.seat || "RAC"}</div>
                            <div>Status: {selected.status}</div>
                            <div>Verified: {selected.verified ? "YES" : "NO"}</div>

                            <div className="flex gap-2 mt-3">

                                <button
                                    onClick={() => verifyPassenger(selected.id)}
                                    className="px-2 border border-gray-600 bg-[#1e3f2b]"
                                >
                                    VERIFY
                                </button>

                                <button
                                    onClick={() => markNoShow(selected.id)}
                                    className="px-2 border border-gray-600 bg-[#4a1f1f]"
                                >
                                    NO SHOW
                                </button>

                            </div>

                        </div>
                    ) : (
                        <div className="text-gray-500">
                            SELECT SEAT
                        </div>
                    )}

                </div>

            </div>

            {/* LOG PANEL */}
            <div className="h-16 border-t border-gray-700 bg-[#181818] p-2 overflow-y-auto text-gray-400">

                {logs.map((log, i) => (
                    <div key={i}>• {log}</div>
                ))}

            </div>

        </div>
    );
}
