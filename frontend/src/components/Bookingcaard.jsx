import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import lookupData from "../data/lookupData.json";

const allStations = lookupData.stations;
const allTrains = lookupData.trains;

export default function BookingCard() {
  const navigate = useNavigate();

  /* ================= STATES ================= */
  const [searchMode, setSearchMode] = useState("route"); // route | train
  const [trainQuery, setTrainQuery] = useState("");
  const [trainSuggestions, setTrainSuggestions] = useState([]);
  const [showTrainSuggestions, setShowTrainSuggestions] = useState(false);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);
  const [filteredFrom, setFilteredFrom] = useState([]);
  const [filteredTo, setFilteredTo] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [passengers, setPassengers] = useState(1);
  const [showPassengers, setShowPassengers] = useState(false);

  const [travelClass, setTravelClass] = useState("General");
  const [showClass, setShowClass] = useState(false);

  const [filters, setFilters] = useState({
    acOnly: false,
    confirmed: false,
    ladies: false,
    tatkal: false,
  });

  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  /* ================= REFS ================= */
  const passengerRef = useRef(null);
  const classRef = useRef(null);
  const fromRef = useRef(null);
  const toRef = useRef(null);
  const dateRef = useRef(null);
  const trainRef = useRef(null);
  const stationDebounceRef = useRef(null);
  const trainDebounceRef = useRef(null);

  /* ================= EFFECTS ================= */
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handler = (e) => {
      if (passengerRef.current && !passengerRef.current.contains(e.target))
        setShowPassengers(false);
      if (classRef.current && !classRef.current.contains(e.target))
        setShowClass(false);
      if (fromRef.current && !fromRef.current.contains(e.target))
        setShowFrom(false);
      if (toRef.current && !toRef.current.contains(e.target))
        setShowTo(false);
      if (trainRef.current && !trainRef.current.contains(e.target))
        setShowTrainSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ================= LOCAL LOOKUP HELPERS ================= */
  const fetchStationSuggestions = (query, setter, showSetter) => {
    if (stationDebounceRef.current) clearTimeout(stationDebounceRef.current);
    if (!query || query.length < 2) { setter([]); return; }
    stationDebounceRef.current = setTimeout(() => {
      const q = query.toLowerCase();
      const results = allStations.filter(s =>
        s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
      ).slice(0, 10);
      setter(results);
      showSetter(results.length > 0);
    }, 150);
  };

  const fetchTrainSuggestions = (query) => {
    if (trainDebounceRef.current) clearTimeout(trainDebounceRef.current);
    if (!query || query.length < 2) { setTrainSuggestions([]); return; }
    trainDebounceRef.current = setTimeout(() => {
      const q = query.toLowerCase();
      const results = allTrains.filter(t =>
        t.trainName.toLowerCase().includes(q) || t.trainNumber.includes(q)
      ).slice(0, 8);
      setTrainSuggestions(results);
      setShowTrainSuggestions(results.length > 0);
    }, 150);
  };

  /* ================= HELPERS ================= */
  const formatDate = (date) =>
    date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  /* ================= NAVIGATE ================= */
  const handleSearch = () => {
    if (searchMode === "route") {
      if (!from || !to) {
        setError("Please select both source and destination");
        return;
      }
      if (from === to) {
        setError("Source and destination cannot be the same");
        return;
      }
      navigate(`/results?mode=route&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${selectedDate.toISOString()}&class=${travelClass}`);
    }

    if (searchMode === "train") {
      if (!trainQuery) {
        setError("Please enter train name or number");
        return;
      }
      navigate(`/results?mode=train&q=${encodeURIComponent(trainQuery)}`);
    }

    setError("");
  };

  /* ================= JSX ================= */
  return (
    <div className="relative max-w-6xl mx-auto mt-2 md:mt-3 lg:mt-4 px-4">

      <div
        className={`
          bg-white rounded-2xl md:rounded-[28px]
          shadow-[0_24px_55px_rgba(0,0,0,0.15)]
          transition-all duration-500 ease-out
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        `}
      >
        {/* SEARCH MODE TOGGLES */}
        <div className="flex justify-center gap-3 md:gap-4 pt-4 md:pt-6 pb-4 md:pb-6 px-4">
          {["route", "train"].map((mode) => (
            <button
              key={mode}
              onClick={() => setSearchMode(mode)}
              className={`
                flex-1 max-w-[220px] h-[48px] md:h-[52px]
                rounded-full text-sm md:text-base font-semibold
                bg-white
                border-2
                transition
                ${searchMode === mode
                  ? "border-dashed border-[#242424] text-[#242424]"
                  : "border-solid border-[#E5E5E5] text-[#6B6B6B]"
                }
              `}
            >
              {mode === "route" ? "Search by Place" : "Search by Train"}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="px-4 md:px-6 pb-5 md:pb-6 pt-4 bg-[#D4D4D4]/50 rounded-2xl md:rounded-[28px] border-t border-white/40">

          {/* INPUT ROW */}
          <div
            className="
              grid grid-cols-1
              md:grid-cols-2
              lg:grid-cols-[1fr_auto_1fr_auto_1fr]
              gap-3 items-center
            "
          >
            {/* TRAIN MODE */}
            {searchMode === "train" && (
              <div ref={trainRef} className="relative md:col-span-2 lg:col-span-3 bg-[#F5F5F5] rounded-xl px-4 py-4">
                <label className="text-[11px] text-[#6B6B6B]">
                  Train Name / Number
                </label>
                <input
                  value={trainQuery}
                  onChange={(e) => {
                    const v = e.target.value;
                    setTrainQuery(v);
                    fetchTrainSuggestions(v);
                  }}
                  onFocus={() => { if (trainSuggestions.length > 0) setShowTrainSuggestions(true); }}
                  className="w-full bg-transparent outline-none text-sm font-medium text-[#242424] mt-1"
                  placeholder="12301 / Rajdhani Express"
                />

                {/* TRAIN SUGGESTIONS DROPDOWN */}
                {showTrainSuggestions && trainSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-lg z-50 border border-[#D4D4D4] max-h-60 overflow-y-auto">
                    {trainSuggestions.map((train, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setTrainQuery(`${train.trainName} (${train.trainNumber})`);
                          setShowTrainSuggestions(false);
                        }}
                        className="px-4 py-3 hover:bg-[#D4D4D4]/40 cursor-pointer border-b border-[#E5E5E5] last:border-b-0"
                      >
                        <div className="text-sm font-medium text-[#242424]">{train.trainName}</div>
                        <div className="text-xs text-[#6B6B6B]">#{train.trainNumber} • {train.source} → {train.destination}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ROUTE MODE */}
            {searchMode === "route" && (
              <>
                <div ref={fromRef} className="relative bg-[#F5F5F5] rounded-xl px-4 py-4">
                  <label className="text-[11px] text-[#6B6B6B]">From</label>
                  <input
                    value={from}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFrom(v);
                      fetchStationSuggestions(v, setFilteredFrom, setShowFrom);
                    }}
                    className="w-full bg-transparent outline-none text-sm font-medium text-[#242424] mt-1"
                    placeholder="Enter source"
                  />

                  {/* FROM SUGGESTIONS DROPDOWN */}
                  {showFrom && filteredFrom.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-lg z-50 border border-[#D4D4D4] max-h-60 overflow-y-auto">
                      {filteredFrom.slice(0, 10).map((station, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setFrom(`${station.name} (${station.code})`);
                            setShowFrom(false);
                          }}
                          className="px-4 py-3 hover:bg-[#D4D4D4]/40 cursor-pointer border-b border-[#E5E5E5] last:border-b-0"
                        >
                          <div className="text-sm font-medium text-[#242424]">{station.name}</div>
                          <div className="text-xs text-[#6B6B6B]">{station.code}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSwap}
                  className="h-11 w-11 mx-auto md:mx-0 rounded-full bg-[#242424] text-white hover:scale-105 transition"
                >
                  ⇄
                </button>

                <div ref={toRef} className="relative bg-[#F5F5F5] rounded-xl px-4 py-4">
                  <label className="text-[11px] text-[#6B6B6B]">To</label>
                  <input
                    value={to}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTo(v);
                      fetchStationSuggestions(v, setFilteredTo, setShowTo);
                    }}
                    className="w-full bg-transparent outline-none text-sm font-medium text-[#242424] mt-1"
                    placeholder="Enter destination"
                  />

                  {/* TO SUGGESTIONS DROPDOWN */}
                  {showTo && filteredTo.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-lg z-50 border border-[#D4D4D4] max-h-60 overflow-y-auto">
                      {filteredTo.slice(0, 10).map((station, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setTo(`${station.name} (${station.code})`);
                            setShowTo(false);
                          }}
                          className="px-4 py-3 hover:bg-[#D4D4D4]/40 cursor-pointer border-b border-[#E5E5E5] last:border-b-0"
                        >
                          <div className="text-sm font-medium text-[#242424]">{station.name}</div>
                          <div className="text-xs text-[#6B6B6B]">{station.code}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* DATE (CALENDAR OPENS ABOVE WITH 2px GAP) */}
            <div ref={dateRef} className="relative md:col-span-2 lg:col-span-1">

              {/* Visible Date Card */}
              <div
                className="bg-[#F5F5F5] rounded-xl px-4 py-4 cursor-pointer"
                onClick={() => dateRef.current?.querySelector("input")?.showPicker()}
              >
                <label className="text-[11px] text-[#6B6B6B]">Date</label>
                <div className="text-sm font-semibold text-[#242424] mt-1">
                  {formatDate(selectedDate)}
                </div>
              </div>

              {/* Hidden Date Input (controls calendar position) */}
              <input
                type="date"
                value={selectedDate.toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="
      absolute
      bottom-full
      mb-[2px]
      left-0
      w-full
      h-[44px]
      opacity-0
      cursor-pointer
    "
              />
            </div>


            {/* SEARCH */}
            <button
              onClick={handleSearch}
              className="md:col-span-2 lg:col-span-1 px-8 py-4 rounded-xl bg-[#242424] text-white font-semibold hover:bg-black transition"
            >
              SEARCH
            </button>
          </div>

          {/* FILTERS + DROPDOWNS */}
          <div className="mt-4 md:mt-5">
            {/* QUICK FILTERS TEXT */}
            <div className="text-xs md:text-sm font-medium text-[#6B6B6B] mb-3">Quick Filters</div>

            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              {[
                ["AC Only", "acOnly"],
                ["Confirmed Seats", "confirmed"],
                ["Ladies Quota", "ladies"],
                ["Tatkal", "tatkal"],
              ].map(([label, key]) => (
                <button
                  key={key}
                  onClick={() => setFilters({ ...filters, [key]: !filters[key] })}
                  className={`px-3 md:px-4 py-2.5 rounded-full border text-xs md:text-sm transition
                    ${filters[key]
                      ? "bg-[#242424] text-white border-[#242424]"
                      : "bg-white text-[#242424] border-[#B3B3B3]"
                    }`}
                >
                  {label}
                </button>
              ))}

              {/* SPACER FOR DESKTOP */}
              <div className="hidden lg:block flex-1"></div>

              {/* PASSENGERS DROPDOWN */}
              <div ref={passengerRef} className="relative w-full sm:w-auto">
                <button
                  onClick={() => setShowPassengers(!showPassengers)}
                  className="w-full sm:w-auto px-3 md:px-4 py-2.5 rounded-full border border-[#B3B3B3] bg-white text-[#242424] text-xs md:text-sm whitespace-nowrap text-center"
                >
                  Passengers: {passengers} ▾
                </button>

                {showPassengers && (
                  <div className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 bottom-full mb-2 bg-white rounded-xl shadow-lg z-50 border border-[#D4D4D4] min-w-[160px]">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div
                        key={n}
                        onClick={() => {
                          setPassengers(n);
                          setShowPassengers(false);
                        }}
                        className="px-4 py-2.5 hover:bg-[#D4D4D4]/40 cursor-pointer text-sm text-[#242424] border-b border-[#E5E5E5] last:border-b-0"
                      >
                        {n} Passenger{n > 1 ? "s" : ""}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CLASS DROPDOWN */}
              <div ref={classRef} className="relative w-full sm:w-auto">
                <button
                  onClick={() => setShowClass(!showClass)}
                  className="w-full sm:w-auto px-3 md:px-4 py-2.5 rounded-full border border-[#B3B3B3] bg-white text-[#242424] text-xs md:text-sm whitespace-nowrap text-center"
                >
                  Class: {travelClass} ▾
                </button>

                {showClass && (
                  <div className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 bottom-full mb-2 bg-white rounded-xl shadow-lg z-50 border border-[#D4D4D4] min-w-[180px]">
                    {[
                      "General",
                      "Sleeper (SL)",
                      "Second Sitting (2S)",
                      "AC 3 Tier (3A)",
                      "AC 2 Tier (2A)",
                      "AC 1 Tier (1A)",
                    ].map((c) => (
                      <div
                        key={c}
                        onClick={() => {
                          setTravelClass(c);
                          setShowClass(false);
                        }}
                        className="px-4 py-2.5 hover:bg-[#D4D4D4]/40 cursor-pointer text-sm text-[#242424] border-b border-[#E5E5E5] last:border-b-0"
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-center text-red-600 text-sm mt-3 font-medium">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}