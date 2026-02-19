import { useState, useEffect, useRef } from "react";
import LabelNavbar from "./LabelNavbar";
import PNRResult from "./Pnrresult";

export default function PNRStatus() {
  const [pnr, setPnr] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. ADDED ACCESSIBILITY: Listen for "Enter" key globally
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && pnr.length === 10 && !loading && !showResult) {
        handleCheckStatus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pnr, loading, showResult]);

  // 2. ENHANCED DUMMY DATA: Now includes Fare, Distance, and Confirmation Logic
  const dummyData = {
    pnr: pnr,
    trainName: "Sachkhand Express",
    trainNumber: "12716",
    class: "Third AC (3A)",
    fromStation: "New Delhi",
    fromCode: "NDLS",
    toStation: "Aurangabad",
    toCode: "AWB",
    departureDate: "21 Apr 2024, 13:00",
    arrivalDate: "22 Apr 2024, 09:40",
    duration: "20h 40m",
    distance: "1399 km",
    totalFare: "₹1,630",
    chartStatus: "Not Prepared",
    passengers: [
      { name: "Chander Kanta", booking: "CNF/B5/57", current: "CNF", isConfirmed: true },
      { name: "Laxmi Jindal", booking: "CNF/B5/58", current: "CNF", isConfirmed: true },
      { name: "Rajesh Jindal", booking: "RLWL/12", current: "CNF", isConfirmed: true },
      { name: "Darshana Devi", booking: "RLWL/13", current: "RAC/2", isConfirmed: false },
      { name: "Suresh Kumar", booking: "W/L 45", current: "W/L 12", isConfirmed: false },
      { name: "Anita Rani", booking: "W/L 46", current: "W/L 13", isConfirmed: false },
    ]
  };

  const handleCheckStatus = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowResult(true);
    }, 800);
  };
  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) setPnr(value);
  };

  const inputRef = useRef(null);

  const resetToForm = () => {
    setShowResult(false);
    setPnr("");
    // scroll to the pnr section and focus input after render
    requestAnimationFrame(() => {
      const el = document.getElementById('pnr-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (inputRef.current) inputRef.current.focus();
    });
  };

  return (
    <>
      <LabelNavbar />

      <div id="pnr-section" className="max-w-6xl mx-auto mt-28 px-4 pb-14 flex justify-center flex-col text-white">

        {!showResult ? (
          <>
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-black tracking-tight uppercase">
                {loading ? "Fetching Details..." : "Check PNR Status"}
              </h2>
              <p className="text-gray-400 mt-3 max-w-2xl mx-auto lg:mx-0 text-base leading-relaxed">
                Your Passenger Name Record (PNR) is a unique 10-digit digital certificate.
                Enter it below to unlock real-time journey updates and seat confirmation.
              </p>
            </div>

            <div className={`mt-10 flex flex-col items-center lg:flex-row lg:justify-between gap-10 transition-opacity ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="relative w-full max-w-md lg:max-w-xl group">
                <input
                  ref={inputRef}
                  type="text"
                  value={pnr}
                  onChange={handleChange}
                  maxLength={10}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex justify-between gap-2 lg:gap-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className={`flex-1 h-16 lg:h-20 border-b-4 flex items-center justify-center text-3xl lg:text-5xl font-black transition-all duration-300 ${i < pnr.length ? "border-white text-white" : "border-white/10 text-white/5"} ${i === pnr.length ? "border-white/50 animate-pulse" : ""}`}>
                      {pnr[i] || "0"}
                    </div>
                  ))}
                </div>
                <span className="block mt-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] text-center lg:text-left">
                  Press Enter to search
                </span>
              </div>

              <button
                onClick={handleCheckStatus}
                disabled={pnr.length !== 10 || loading}
                className={`w-full lg:w-auto px-16 py-6 rounded-full font-black text-lg transition-all ${pnr.length === 10 ? "bg-white text-black hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]" : "bg-white/5 text-white/20 cursor-not-allowed"}`}
              >
                {loading ? "PROCESSING..." : "CHECK STATUS"}
              </button>
            </div>
          </>
        ) : (
          <PNRResult
            pnrData={dummyData}
            onReset={resetToForm}
          />
        )}

        {!showResult && (
          <div className="mt-11 grid grid-cols-2 lg:grid-cols-4 gap-8 border-t border-white/10 pt-10">

          </div>
        )}
      </div>
    </>
  );
}