import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import MiniFooter from "../components/MiniFooter";

export default function PassengerDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const [state, setState] = useState(location.state);

  useEffect(() => {
    setState(location.state);
  }, [location.state]);

  const { train, selectedSeats, classType, journeyDate, source, destination } = state || {};

  // Extract station code from "Name (CODE)" format
  const extractCode = (str) => {
    if (!str) return str;
    const match = str.match(/\(([^)]+)\)$/);
    return match ? match[1] : str;
  };

  const [passengers, setPassengers] = useState([]);
  const [aadharList, setAadharList] = useState({});
  const [loading, setLoading] = useState(false);
  const [farePerPerson, setFarePerPerson] = useState(0);

  useEffect(() => {
    // Wait until state actually loads
    if (!state) return;

    if (!selectedSeats || selectedSeats.length === 0) {
      navigate("/"); // Redirect if no seats mapped
      return;
    }
    // Initialize passengers based on selected seats
    const initialPassengers = selectedSeats.map((seat, index) => ({
      id: index,
      seatNumber: seat.seatNumber,
      coachId: seat.coachId,
      name: "",
      age: "",
      gender: "Gender",
      berth: seat.berthType
    }));
    setPassengers(initialPassengers);
  }, [selectedSeats, navigate]);

  // Fetch real fare
  useEffect(() => {
    if (!train?.trainNumber || !classType) return;
    const srcCode = extractCode(source || train.source);
    const dstCode = extractCode(destination || train.destination);
    api.getFare(train.trainNumber, srcCode, dstCode)
      .then(data => {
        if (data.fares && data.fares[classType]) {
          setFarePerPerson(data.fares[classType]);
        }
      })
      .catch(() => setFarePerPerson(500)); // fallback
  }, [train, classType, source, destination]);

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

  const handleChange = (id, field, value) => {
    setPassengers(passengers.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleAadharChange = (id, value) => {
    setAadharList({ ...aadharList, [id]: value.replace(/\D/g, "").slice(0, 12) });
  };

  const handleSubmit = async () => {
    // TEMP: Validation disabled for preview
    // if (passengers.some(p => !p.name || !p.age || p.gender === "Gender")) {
    //   alert("Please fill all passenger details");
    //   return;
    // }

    // if (Object.keys(aadharList).length !== passengers.length || Object.values(aadharList).some(v => v.length < 12)) {
    //   alert("Please provide valid 12-digit Aadhar number for all passengers");
    //   return;
    // }

    const payload = {
      trainNumber: train.trainNumber,
      journeyDate,
      classCode: classType,
      source: extractCode(source || train.source),
      destination: extractCode(destination || train.destination),
      trainSchedule: train.schedule || [],
      passengers: passengers.map(p => ({
        name: p.name || `Passenger ${p.seatNumber}`,
        age: p.age ? parseInt(p.age) : 25,
        gender: p.gender !== "Gender" ? p.gender : "Male",
        seatNumber: p.seatNumber,
        coachId: p.coachId,
        berthPreference: p.berth,
        aadhar: aadharList[p.id] && aadharList[p.id].length >= 12 ? aadharList[p.id] : "123456789012"
      }))
    };

    const baseFare = farePerPerson * passengers.length;
    const serviceTax = Math.round(baseFare * 0.05);
    const convenienceFee = 20;
    const totalAmount = baseFare + serviceTax + convenienceFee;

    navigate("/payment", {
      state: {
        payload,
        totalAmount,
        trainName: train.trainName,
        trainNumber: train.trainNumber,
        classType,
        journeyDate,
        passengerCount: passengers.length,
      },
    });
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-100">
        <div className="text-center max-w-md px-6">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-3">Session Expired</h1>
          <p className="text-gray-400 mb-6">
            Your booking data was lost due to a page reload. Please go back and select your seats again.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl font-bold text-gray-900 transition"
            style={{ backgroundColor: '#e2e8f0' }}
          >
            ← Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-[#0f172a] pb-20 px-4 text-gray-100 font-sans relative">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Ticket Header Summary */}
        <div style={{ backgroundColor: '#2B2B2B' }} className="rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden">
          {/* Cutout circles for ticket effect */}
          <div className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 rounded-full" style={{ backgroundColor: '#0f172a' }}></div>
          <div className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 rounded-full" style={{ backgroundColor: '#0f172a' }}></div>

          <div className="flex flex-col md:flex-row justify-between items-center relative z-10 px-2 sm:px-4 md:px-6 gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">{train?.trainName} <span className="text-orange-500">#{train?.trainNumber}</span></h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400 font-mono">
                <span className="bg-[#1D2332] text-gray-200 px-2 sm:px-3 py-1 rounded-full border border-gray-700">{classType} Class</span>
                <span>•</span>
                <span>{new Date(journeyDate).toDateString()}</span>
              </div>
            </div>
            <div className="text-center md:text-right border-t border-gray-700/50 md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
              <div className="text-2xl sm:text-3xl font-bold text-white">{selectedSeats.length} <span className="text-lg font-normal text-gray-400">Seats</span></div>
              <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide mt-1">Selected</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Passenger Forms */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>Passenger Details</span>
              <div className="h-px flex-1 bg-gray-700"></div>
            </h2>

            {passengers.map((p, idx) => (
              <div key={p.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-md">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
                  <span className="font-semibold text-orange-400">Passenger {idx + 1}</span>
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">Seat {p.seatNumber} ({p.coachId})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 ml-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter Full Name"
                      value={p.name}
                      onChange={(e) => handleChange(p.id, "name", e.target.value)}
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500 text-white placeholder-gray-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 ml-1">Age</label>
                      <input
                        type="number"
                        placeholder="Age"
                        value={p.age}
                        onChange={(e) => handleChange(p.id, "age", e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500 text-white placeholder-gray-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 ml-1">Gender</label>
                      <select
                        value={p.gender}
                        onChange={(e) => handleChange(p.id, "gender", e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500 text-white"
                      >
                        <option value="Gender" disabled>Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs text-gray-400 ml-1">Aadhar Number (Encrypted)</label>
                    <input
                      type="password"
                      maxLength="12"
                      placeholder="XXXX-XXXX-XXXX"
                      value={aadharList[p.id] || ""}
                      onChange={(e) => handleAadharChange(p.id, e.target.value)}
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500 text-white tracking-widest"
                    />
                    <p className="text-[10px] text-gray-500 text-right">Visible only to Admin & TTE</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Fare Summary Side Panel */}
          <div className="md:col-span-1">
            <div className="hidden md:block h-[44px]"></div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 sticky top-24">
              <h3 className="text-lg font-semibold mb-4 text-white">Payment Details</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Ticket Fare (x{passengers.length})</span>
                  <span>₹{passengers.length * 500}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Service Charge</span>
                  <span>₹20</span>
                </div>
                <div className="h-px bg-gray-700 my-2"></div>
                <div className="flex justify-between font-bold text-white text-lg">
                  <span>Total</span>
                  <span>₹{passengers.length * 500 + 20}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-orange-500/20 transition duration-300 flex justify-center items-center gap-2"
              >
                {loading ? "Processing..." : "Proceed to Pay"}
              </button>
              <p className="text-xs text-center text-gray-500 mt-4">Safe & Secure Payment</p>
            </div>
          </div>
        </div>
      </div>
      <MiniFooter />
    </div>
  );
}
