import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import MiniFooter from "../components/MiniFooter";

// Helper Component for Seat
function SeatButton({ seat, isSelected, onClick }) {
    return (
        <button
            onClick={onClick}
            disabled={seat.isBooked}
            className={`
                relative h-12 w-12 md:h-14 md:w-14 rounded-lg flex items-center justify-center text-sm font-bold transition-colors duration-200
                ${seat.isBooked
                    ? "bg-[#383838] text-gray-500 cursor-not-allowed opacity-50 border border-gray-600"
                    : isSelected
                        ? "text-white border-2 shadow-[0_0_6px_rgba(74,184,109,0.2)]"
                        : "bg-transparent text-gray-300 hover:shadow-lg"
                }
            `}
            style={!seat.isBooked ? (
                isSelected
                    ? { backgroundColor: '#4ab86d', borderColor: '#3d9960' }
                    : { borderWidth: '1px', borderStyle: 'solid', borderColor: '#4ab86d' }
            ) : undefined}
        >
            <span className="z-10">{seat.seatNumber}</span>
            <span
                className={`absolute -top-2 -right-2 text-[9px] font-mono px-1 rounded shadow-sm border ${isSelected ? "text-white" : "bg-[#1D2332] border-gray-600 text-gray-400"}`}
                style={isSelected ? { backgroundColor: '#3d9960', borderColor: '#4ab86d' } : undefined}
            >
                {seat.berthType?.substring(0, 2)}
            </span>
        </button>
    );
}

export default function SeatLayout() {
    const { trainNumber, classType } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const source = searchParams.get("from");
    const destination = searchParams.get("to");
    const dateParam = searchParams.get("date");
    const journeyDate = dateParam ? dateParam.split("T")[0] : new Date().toISOString().split("T")[0];

    const [loading, setLoading] = useState(true);
    const [layoutData, setLayoutData] = useState(null);
    const [selectedCoachId, setSelectedCoachId] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [trainDetails, setTrainDetails] = useState(null);
    const [passengerCount, setPassengerCount] = useState(Number(searchParams.get("passengers")) || 1);
    const [isEditingPassengers, setIsEditingPassengers] = useState(false);
    const [farePerPerson, setFarePerPerson] = useState(0);

    // Warn before reload
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = "Your data will be lost.";
            return e.returnValue;
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Quick fetch for basic details
                const details = await api.getTrainDetails(trainNumber);
                setTrainDetails(details);

                // Fetch Seat Layout
                const data = await api.getSeatLayout(trainNumber);

                if (data && data.coaches) {
                    // Filter relevant coaches if classType is specified
                    const filtered = data.coaches.filter(c => c.classCode === classType);

                    // If no exact match (sometimes data mismatch), fallback to all or 1st
                    const displayCoaches = filtered.length > 0 ? filtered : data.coaches;

                    // Normalize: backend uses coachNumber, frontend uses coachId
                    const normalizedCoaches = displayCoaches.map(c => ({
                        ...c,
                        coachId: c.coachId || c.coachNumber
                    }));

                    setLayoutData({ ...data, coaches: normalizedCoaches });
                    if (normalizedCoaches.length > 0) setSelectedCoachId(normalizedCoaches[0].coachId);
                }

            } catch (err) {
                console.error("Failed to load seat layout", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [trainNumber, classType]);

    // Fetch real fare
    useEffect(() => {
        if (!trainNumber || !classType) return;
        const srcCode = source?.match(/\(([^)]+)\)$/)?.[1] || source;
        const dstCode = destination?.match(/\(([^)]+)\)$/)?.[1] || destination;
        api.getFare(trainNumber, srcCode, dstCode)
            .then(data => {
                if (data.fares && data.fares[classType]) {
                    setFarePerPerson(data.fares[classType]);
                }
            })
            .catch(() => setFarePerPerson(500));
    }, [trainNumber, classType, source, destination]);

    const toggleSeat = (seat, coachId) => {
        if (seat.isBooked) return;

        const seatId = `${coachId} -${seat.seatNumber} `;
        const isSelected = selectedSeats.some(s => s.uid === seatId);

        if (isSelected) {
            setSelectedSeats(selectedSeats.filter(s => s.uid !== seatId));
        } else {
            if (selectedSeats.length >= passengerCount) {
                return;
            }
            setSelectedSeats([...selectedSeats, {
                uid: seatId,
                seatNumber: seat.seatNumber,
                coachId: coachId,
                berthType: seat.berthType
            }]);
        }
    };

    const handleProceed = () => {
        if (selectedSeats.length !== passengerCount) {
            alert(`Please select exactly ${passengerCount} seat${passengerCount > 1 ? 's' : ''}.`);
            return;
        }
        navigate("/passenger-details", {
            state: {
                train: trainDetails,
                selectedSeats,
                classType,
                journeyDate,
                source,
                destination
            }
        });
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-gray-500">
            <div className="animate-spin text-4xl">...</div>
        </div>
    );

    return (
        <div style={{ backgroundColor: '#0f172a' }} className="min-h-screen pt-20 pb-20 px-4 font-sans text-gray-100 relative">
            <div className="max-w-6xl mx-auto">

                {/* Ticket-like Header */}
                <div style={{ backgroundColor: '#2B2B2B' }} className="rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 mb-6 md:mb-8 shadow-2xl relative overflow-hidden">
                    {/* Cutout circles for ticket effect */}
                    <div className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 rounded-full" style={{ backgroundColor: '#0f172a' }}></div>
                    <div className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 rounded-full" style={{ backgroundColor: '#0f172a' }}></div>

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center relative z-10 px-2 sm:px-4 md:px-6 gap-6 lg:gap-4">
                        <div className="flex-[1.5] w-full">
                            <div className="flex flex-wrap items-baseline gap-2 sm:gap-4 mb-3">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white shrink-0">{trainDetails?.trainName || "Express Train"}</h1>
                                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-300 flex items-center gap-2 shrink-0">
                                    <span>{source?.split(' ')[0]}</span>
                                    <span className="text-gray-500">→</span>
                                    <span>{destination?.split(' ')[0]}</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-400 font-mono text-xs sm:text-sm">
                                <span className="bg-[#1D2332] text-gray-200 px-2 sm:px-3 py-1 rounded-full border border-gray-700">
                                    #{trainNumber}
                                </span>
                                <span>{new Date(journeyDate).toDateString()}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="text-white">{classType} Class</span>
                            </div>
                        </div>
                        <div className="lg:border-l border-gray-700/50 lg:pl-6 text-left lg:text-right w-full lg:w-auto shrink-0 flex flex-row lg:flex-col justify-between lg:justify-center items-center lg:items-end">
                            <span className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide lg:mb-1">Passengers</span>
                            {isEditingPassengers ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        max="6"
                                        value={passengerCount || ""}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === "") {
                                                setPassengerCount("");
                                            } else {
                                                let num = parseInt(val);
                                                if (num > 6) num = 6;
                                                setPassengerCount(num);

                                                // Trim extra seats if count is reduced below current selection
                                                if (selectedSeats.length > num) {
                                                    setSelectedSeats(seats => seats.slice(0, num));
                                                }
                                            }
                                        }}
                                        onBlur={() => {
                                            if (!passengerCount || passengerCount < 1) setPassengerCount(1);
                                            // Auto-close when clicking outside
                                            setTimeout(() => setIsEditingPassengers(false), 100);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                if (!passengerCount || passengerCount < 1) setPassengerCount(1);
                                                setIsEditingPassengers(false);
                                            }
                                        }}
                                        autoFocus
                                        className="w-16 bg-[#1D2332] border border-gray-600 rounded px-2 py-1 text-white text-lg font-bold outline-none focus:border-[#4ab86d]"
                                    />
                                    <button
                                        onClick={() => {
                                            if (!passengerCount || passengerCount < 1) setPassengerCount(1);
                                            setIsEditingPassengers(false);
                                        }}
                                        className="text-[#4ab86d] hover:text-white transition p-1"
                                        title="Confirm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-2xl font-bold text-white group cursor-pointer" onClick={() => setIsEditingPassengers(true)}>
                                    <span>{passengerCount}</span>
                                    <span className="text-gray-500 opacity-50 group-hover:opacity-100 transition-opacity mt-1" title="Edit Passengers">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dashed Line */}
                    <div className="w-full h-px border-t-2 border-dashed border-gray-700/50 my-4 sm:my-6 md:my-8"></div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 text-xs sm:text-sm text-gray-400 px-2 sm:px-4 md:px-6">
                        <div className="flex items-center gap-2">
                            Selected: <span className="text-white font-bold text-base sm:text-lg">{selectedSeats.length}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 sm:gap-4">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-transparent" style={{ border: '1px solid #4ab86d' }}></div> Available</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-[#383838] border border-gray-600"></div> Booked</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: '#4ab86d', border: '1px solid #3d9960' }}></div> You</div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Coach Selector - Mobile: horizontal scroll strip */}
                    <div className="lg:hidden mb-4">
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 ml-1">Select Coach</h3>
                        <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                            {layoutData?.coaches?.map(coach => (
                                <button
                                    key={coach.coachId}
                                    onClick={() => setSelectedCoachId(coach.coachId)}
                                    style={{ backgroundColor: selectedCoachId === coach.coachId ? '#4ab86d' : '#383838' }}
                                    className={`flex-shrink-0 snap-center px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2 ${selectedCoachId === coach.coachId
                                        ? "text-white shadow-lg"
                                        : "text-gray-300 hover:text-white"
                                        }`}
                                >
                                    <span className="font-mono">{coach.coachId}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCoachId === coach.coachId ? "bg-white/20 text-white" : "bg-white/10 text-gray-400"}`}>
                                        {coach.seats?.filter(s => !s.isBooked).length}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Coach Selector - Desktop: vertical sidebar */}
                    <div className="hidden lg:block lg:w-1/4">
                        <div className="bg-[#1D2332] rounded-2xl p-4 sticky top-24 border border-white/5 shadow-xl">
                            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 ml-2">Select Coach</h3>
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {layoutData?.coaches?.map(coach => (
                                    <button
                                        key={coach.coachId}
                                        onClick={() => setSelectedCoachId(coach.coachId)}
                                        style={{ backgroundColor: selectedCoachId === coach.coachId ? '#4ab86d' : '#383838' }}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex justify-between items-center group ${selectedCoachId === coach.coachId
                                            ? "text-white border border-green-400 shadow-md"
                                            : "text-gray-300 hover:text-white border border-gray-600"
                                            }`}
                                    >
                                        <span className="font-mono font-bold">{coach.coachId}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${selectedCoachId === coach.coachId ? "bg-white/20 text-white" : "bg-white/10 text-gray-400"}`}>
                                            {coach.seats?.filter(s => !s.isBooked).length}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Seat Map */}
                    <div className="lg:w-3/4">
                        <div className="bg-[#1D2332] border border-white/5 rounded-3xl p-8 min-h-[500px] shadow-2xl relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#383838] text-gray-400 px-6 py-1 rounded-b-lg text-xs font-bold uppercase tracking-widest border border-t-0 border-[#1D2332]">
                                Engine Direction ↑
                            </div>

                            {layoutData?.coaches?.find(c => c.coachId === selectedCoachId) ? (
                                <div className="mt-8 flex flex-col items-center gap-6 max-w-2xl mx-auto">
                                    {/* Group seats into bays of 8 for standard layout logic (1-8, 9-16, etc.) */}
                                    {Array.from({ length: Math.ceil(layoutData.coaches.find(c => c.coachId === selectedCoachId).seats.length / 8) }).map((_, bayIndex) => {
                                        const baySeats = layoutData.coaches.find(c => c.coachId === selectedCoachId).seats.slice(bayIndex * 8, (bayIndex + 1) * 8);

                                        // Separate main bay seats (usually 1-6) and side seats (7-8)
                                        const mainSeats = baySeats.slice(0, 6);
                                        const sideSeats = baySeats.slice(6, 8);

                                        return (
                                            <div key={bayIndex} className="flex gap-8 md:gap-16 border-b border-gray-700/50 pb-6 last:border-0 items-center justify-center">

                                                {/* Main Compartment: 3x2 grid */}
                                                <div className="grid grid-cols-3 gap-3">
                                                    {mainSeats.map(seat => {
                                                        const seatId = `${selectedCoachId} -${seat.seatNumber} `;
                                                        const isSelected = selectedSeats.some(s => s.uid === seatId);
                                                        return (
                                                            <SeatButton
                                                                key={seat.seatNumber}
                                                                seat={seat}
                                                                isSelected={isSelected}
                                                                onClick={() => toggleSeat(seat, selectedCoachId)}
                                                            />
                                                        );
                                                    })}
                                                </div>

                                                {/* Aisle Gap */}

                                                {/* Side Berths */}
                                                <div className="grid grid-cols-1 gap-3 content-center border-l border-dashed border-gray-700/50 pl-8">
                                                    {sideSeats.map(seat => {
                                                        const seatId = `${selectedCoachId} -${seat.seatNumber} `;
                                                        const isSelected = selectedSeats.some(s => s.uid === seatId);
                                                        return (
                                                            <SeatButton
                                                                key={seat.seatNumber}
                                                                seat={seat}
                                                                isSelected={isSelected}
                                                                onClick={() => toggleSeat(seat, selectedCoachId)}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    Select a coach to view seats
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="fixed bottom-0 left-0 right-0 bg-[#1D2332]/95 backdrop-blur-md border-t border-white/5 p-4 z-50">
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <div className="text-white">
                            <div className="text-xs text-gray-400 uppercase font-medium">Total Amount</div>
                            <div className="text-2xl font-bold">₹{selectedSeats.length * (farePerPerson || 0)}</div>
                        </div>
                        <button
                            onClick={handleProceed}
                            disabled={selectedSeats.length !== passengerCount}
                            style={{ backgroundColor: selectedSeats.length !== passengerCount ? '#4b5563' : '#e2e8f0' }}
                            className={`px-8 py-3 rounded-xl font-bold transition shadow-lg flex items-center gap-2 ${selectedSeats.length !== passengerCount
                                ? 'text-gray-300 opacity-50 cursor-not-allowed'
                                : 'text-gray-900 hover:brightness-95'
                                }`}
                        >
                            CONTINUE <span className="text-xl">→</span>
                        </button>
                    </div>
                </div>

            </div>
            <MiniFooter />
        </div>
    );
}