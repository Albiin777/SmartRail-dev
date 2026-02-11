import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import trains from "../data/trains.json";

export default function SeatLayout() {
  const { trainNumber, classType } = useParams();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [passengers, setPassengers] = useState({});
  const [contactInfo, setContactInfo] = useState({ email: "", phone: "", address: "" });

  const train = trains.find((t) => t.number === trainNumber);
  const coachData = train?.classes[classType];

  const { seats, availableList } = useMemo(() => {
    if (!coachData) return { seats: [], availableList: [] };
    const total = coachData.total;
    const countAvailable = total - coachData.booked;
    const allSeats = Array.from({ length: total }, (_, i) => i + 1);
    const seed = parseInt(trainNumber) || 123;
    const shuffled = [...allSeats].sort((a, b) => Math.sin(seed + a) - Math.sin(seed + b));
    return { seats: allSeats, availableList: shuffled.slice(0, countAvailable) };
  }, [coachData, trainNumber]);

  if (!train || !coachData) return <div className="pt-32 text-center text-white">Loading...</div>;

  const isChairCar = classType === "CC" || classType === "2S";
  const basePrice = isChairCar ? 455 : 1180;
  const totalPrice = selectedSeats.length * basePrice;

  const getSeatType = (index) => {
    const pos = index % 6;
    if (pos === 0 || pos === 5) return "WINDOW";
    if (pos === 1 || pos === 4) return "MIDDLE";
    return "AISLE";
  };

  const handleSeatClick = (seat) => {
    if (!availableList.includes(seat)) return; 
    setSelectedSeats(prev => prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]);
  };

  const handlePassengerChange = (seat, field, value) => {
    setPassengers(prev => ({ ...prev, [seat]: { ...prev[seat], [field]: value } }));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] pt-28 pb-40 px-4 text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 bg-[#1e293b] p-6 rounded-2xl border border-white/10 shadow-xl">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{train.name} <span className="text-blue-400">#{train.number}</span></h1>
            <p className="text-slate-400 font-medium">{classType} Class • {isChairCar ? "3+3 Chair Car" : "Standard Sleeper"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Available Seats</p>
            <p className="text-2xl font-black text-white">{availableList.length}</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-8 mb-10 justify-center text-xs font-bold tracking-widest uppercase">
          <div className="flex items-center gap-2"><div className="w-5 h-5 bg-[#334155] rounded-md border border-white/5"></div> <span>Booked (Ash)</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-5 bg-blue-500/20 border border-blue-400 rounded-md"></div> <span>Available (Blue)</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-5 bg-blue-600 rounded-md shadow-lg shadow-blue-500/40"></div> <span>Selected</span></div>
        </div>

        {/* TOP LEVEL COLUMN HEADINGS */}
        {isChairCar && (
          <div className="grid grid-cols-6 gap-4 mb-4 max-w-4xl mx-auto px-10 text-[10px] font-black text-slate-500 text-center tracking-[0.2em]">
            <span>WINDOW</span><span>MIDDLE</span><span>AISLE</span><span>AISLE</span><span>MIDDLE</span><span>WINDOW</span>
          </div>
        )}

        {/* COACH BODY */}
        <div className="relative bg-[#1e293b]/50 border-x-[16px] border-[#334155] rounded-[60px] p-12 max-w-4xl mx-auto shadow-2xl">
          <div className={`grid ${isChairCar ? 'grid-cols-6' : 'grid-cols-8'} gap-4`}>
            {seats.map((seat, index) => {
              const isAvailable = availableList.includes(seat);
              const isSelected = selectedSeats.includes(seat);
              
              return (
                <div
                  key={seat}
                  onClick={() => handleSeatClick(seat)}
                  className={`
                    relative h-14 flex flex-col items-center justify-center rounded-xl transition-all duration-300 cursor-pointer
                    ${!isAvailable ? "bg-[#334155] cursor-not-allowed opacity-30" : 
                      isSelected ? "bg-blue-600 scale-110 shadow-2xl z-10 text-white" : 
                      "bg-blue-500/20 border border-blue-400/30 text-blue-100 hover:bg-blue-500/40 shadow-md"}
                    ${isChairCar && (index % 6 === 2) ? "mr-12" : ""} 
                  `}
                >
                  <span className="text-xs font-black">{seat}</span>
                  {/* INDIVIDUAL SEAT DESCRIPTION */}
                  <span className="text-[6px] mt-1 font-bold opacity-60 uppercase tracking-tighter">
                    {isChairCar ? getSeatType(index) : 'SLEEPER'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-[#1e293b]/95 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl flex items-center justify-between shadow-2xl z-50">
           <div className="px-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{selectedSeats.length} Seat(s) Selected</p>
              <p className="text-2xl font-black text-white">₹{totalPrice.toLocaleString()}</p>
           </div>
           <button 
             onClick={() => setShowSummary(true)}
             disabled={selectedSeats.length === 0}
             className="bg-blue-600 hover:bg-blue-500 text-white disabled:bg-slate-700 px-10 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20"
           >
             Book Now
           </button>
        </div>

        {/* IRCTC-STYLE PASSENGER & SUMMARY MODAL */}
        {showSummary && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#f3f4f6] text-slate-900 w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
              <div className="bg-[#1e293b] p-4 text-white flex justify-between items-center">
                <h3 className="font-bold uppercase text-sm tracking-tight">Booking Summary & Passenger Details</h3>
                <button onClick={() => setShowSummary(false)} className="text-white text-xl">✕</button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[85vh] space-y-6">
                {/* Journey Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <span className="font-black text-blue-900 text-lg">{train.name} ({train.number})</span>
                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase">{classType} | GENERAL</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest px-2">
                    <span>{train.route[0]}</span>
                    <span className="text-blue-600">🚂 ──────────</span>
                    <span>{train.route[train.route.length - 1]}</span>
                  </div>
                </div>

                {/* Passenger Inputs */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-blue-600 pl-3">Enter Traveler Details</h4>
                  {selectedSeats.map((seat) => (
                    <div key={seat} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
                      <div className="bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center font-black">#{seat}</div>
                      <input 
                        placeholder="Name" 
                        className="flex-1 border-b py-2 text-sm outline-none focus:border-blue-600 transition-all"
                        onChange={(e) => handlePassengerChange(seat, "name", e.target.value)}
                      />
                      <input 
                        type="number" 
                        placeholder="Age" 
                        className="w-16 border-b py-2 text-sm outline-none"
                        onChange={(e) => handlePassengerChange(seat, "age", e.target.value)}
                      />
                      <select 
                        className="w-28 border-b py-2 text-sm outline-none"
                        onChange={(e) => handlePassengerChange(seat, "gender", e.target.value)}
                      >
                        <option>Gender</option>
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>
                  ))}
                </div>

                {/* Contact Section */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-blue-600 pl-3">Contact & Address</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Mobile" className="border rounded-xl p-3 text-sm" onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})} />
                    <input placeholder="Email" className="border rounded-xl p-3 text-sm" onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})} />
                  </div>
                  <textarea placeholder="Destination Address" className="w-full border rounded-xl p-3 text-sm h-20" onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})} />
                </div>

                {/* Final Fare & CTA */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                   <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Grand Total</p>
                      <p className="text-3xl font-black text-blue-900">₹{(totalPrice + 17.70).toLocaleString()}</p>
                   </div>
                   <button 
                     className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 transition-all"
                     onClick={() => alert("Redirecting to Secure Payment...")}
                   >
                     Pay & Book
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}