import { useState } from "react";

export default function PNRStatus() {
  const [pnr, setPnr] = useState("");

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) setPnr(value);
  };

  return (
    <div id="pnr-section" className="max-w-6xl mx-auto mt-20 px-6 pb-24 text-white">
      {/* 1. CREATIVE HEADER */}
      <div className="text-center lg:text-left mb-12">
        <h2 className="text-4xl font-black tracking-tight uppercase">Check PNR Status</h2>
        <p className="text-gray-400 mt-3 max-w-2xl mx-auto lg:mx-0 text-base leading-relaxed">
          Your Passenger Name Record (PNR) is a unique 10-digit digital certificate. 
          Enter it below to unlock real-time journey updates and seat confirmation.
        </p>
      </div>

      {/* 2. INNOVATIVE INPUT TRACK */}
      <div className="flex flex-col items-center lg:flex-row lg:justify-between gap-10">
        
        {/* THE _ _ _ FORM (SLIGHTLY BIGGER) */}
        <div className="relative w-full max-w-md lg:max-w-xl group">
          <input
            type="text"
            value={pnr}
            onChange={handleChange}
            maxLength={10}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            autoFocus
          />
          
          <div className="flex justify-between gap-2 lg:gap-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`
                  flex-1 h-16 lg:h-20 border-b-4 flex items-center justify-center
                  text-3xl lg:text-5xl font-black transition-all duration-300
                  ${i < pnr.length ? "border-white text-white" : "border-white/10 text-white/5"}
                  ${i === pnr.length ? "border-white/50 animate-pulse" : ""}
                `}
              >
                {pnr[i] || "0"}
              </div>
            ))}
          </div>
          <span className="block mt-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] text-center lg:text-left">
            10-Digit Identifier Entry
          </span>
        </div>

        {/* ACTION BUTTON */}
        <button
          disabled={pnr.length !== 10}
          className={`
            w-full lg:w-auto px-16 py-6 rounded-full font-black text-lg transition-all
            ${pnr.length === 10 
              ? "bg-white text-black hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]" 
              : "bg-white/5 text-white/20 cursor-not-allowed"}
          `}
        >
          CHECK STATUS
        </button>
      </div>

      {/* 3. INFORMATION GRID (Ticker Style) */}
      <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8 border-t border-white/10 pt-10">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Structure</span>
          <p className="text-xs text-gray-500 leading-snug">
            3 digits (PRS location) + 7 system-generated digits.
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Zone Logic</span>
          <p className="text-xs text-gray-500 leading-snug">
            The 1st digit indicates the train's originating railway zone.
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Validity</span>
          <p className="text-xs text-gray-500 leading-snug">
            PNR records remain active in the system for 9 months.
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Real-Time</span>
          <p className="text-xs text-gray-500 leading-snug">
            Status updates instantly based on cancellations or chart prep.
          </p>
        </div>
      </div>
    </div>
  );
}