import { useState } from "react";
import './App.css';
import Header from "./components/Header";
import Footer from "./components/Footer";
import LabelNavbar from "./components/LabelNavbar";

/* ==================== Icon Components ==================== */
function SearchIcon({ size = 20, className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

const CalendarIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const SwapIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 3L4 7l4 4" />
    <path d="M4 7h16" />
    <path d="m16 21 4-4-4-4" />
    <path d="M20 17H4" />
  </svg>
);

const TrainIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="3" width="16" height="16" rx="2" />
    <path d="M4 11h16" />
    <path d="M12 3v8" />
    <path d="m8 19-2 3" />
    <path d="m18 22-2-3" />
    <path d="M8 15h0" />
    <path d="M16 15h0" />
  </svg>
);

const MapPinIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const UsersIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

/* ==================== Main App Component ==================== */
export default function App() {
  const [theme] = useState("dark");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchMode, setSearchMode] = useState("route");

  // Form States
  const [trainNameNumber, setTrainNameNumber] = useState("");
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [date, setDate] = useState("");
  const [classType, setClassType] = useState("AC 3 Tier");
  const [passengers, setPassengers] = useState("1");

  const isDark = theme === "dark";

  const swapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const handleSearch = () => {
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 700);
    console.log("Searching...", { 
      searchMode, 
      trainNameNumber, 
      fromStation, 
      toStation, 
      date, 
      classType, 
      passengers 
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header />
      <LabelNavbar hidden={hidden} />
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden flex-1 pt-[70px]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "",
          }}
        />

        {/* Gradient Overlay */}
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-gradient-to-br from-[#0a1633]/95 via-[#102a5c]/90 to-[#050b1c]/95"
              : "bg-gradient-to-br from-blue-900/80 via-indigo-900/70 to-blue-800/80"
          }`}
        />

        {/* Content */}
        <div
          className={`relative z-10 px-4 py-12 md:py-20 transition-all duration-700 ${
            isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          <div className="max-w-4xl mx-auto">
            
            {/* ========== Title Section ========== */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-blue-600/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-blue-400/30">
                <TrainIcon size={18} className="text-blue-400" />
                <span className="text-blue-300 text-sm font-medium">SmartRail Booking</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                Your Journey
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Starts Here
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                Experience seamless railway booking and real-time train tracking across India
              </p>
            </div>

            {/* ========== Search Card ========== */}
            <div
              className={`backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 border ${
                isDark 
                  ? "bg-gray-800/80 border-gray-700/50" 
                  : "bg-white/95 border-gray-200"
              }`}
            >
              
              {/* Mode Toggle */}
              <div className="flex gap-2 mb-6 p-1.5 bg-gray-700/50 rounded-xl">
                {["route", "train"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSearchMode(mode)}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                      searchMode === mode
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25"
                        : "text-gray-400 hover:text-gray-200 hover:bg-gray-600/30"
                    }`}
                  >
                    {mode === "route" ? (
                      <>
                        <MapPinIcon size={16} />
                        Search by Route
                      </>
                    ) : (
                      <>
                        <TrainIcon size={16} />
                        Search by Train
                      </>
                    )}
                  </button>
                ))}
              </div>

              {/* ========== Search Inputs ========== */}
              {searchMode === "train" ? (
                /* Train Search Mode */
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Train Name or Number
                  </label>
                  <div className="relative">
                    <TrainIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={trainNameNumber}
                      onChange={(e) => setTrainNameNumber(e.target.value)}
                      placeholder="e.g., 12301 or Rajdhani Express"
                      className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              ) : (
                /* Route Search Mode */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      From Station
                    </label>
                    <div className="relative">
                      <MapPinIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400" />
                      <input
                        type="text"
                        value={fromStation}
                        onChange={(e) => setFromStation(e.target.value)}
                        placeholder="Enter departure station"
                        className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      To Station
                    </label>
                    <div className="relative">
                      <MapPinIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400" />
                      <input
                        type="text"
                        value={toStation}
                        onChange={(e) => setToStation(e.target.value)}
                        placeholder="Enter arrival station"
                        className="w-full pl-12 pr-14 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <button
                        onClick={swapStations}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                        title="Swap stations"
                      >
                        <SwapIcon size={18} className="text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ========== Date, Class, Passengers ========== */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Travel Date
                  </label>
                  <div className="relative">
                    <CalendarIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Travel Class
                  </label>
                  <div className="relative">
                    <select
                      value={classType}
                      onChange={(e) => setClassType(e.target.value)}
                      className="w-full px-4 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer appearance-none"
                    >
                      <option value="AC 1st Class">AC 1st Class (1A)</option>
                      <option value="AC 2 Tier">AC 2 Tier (2A)</option>
                      <option value="AC 3 Tier">AC 3 Tier (3A)</option>
                      <option value="AC 3 Economy">AC 3 Economy (3E)</option>
                      <option value="Sleeper">Sleeper (SL)</option>
                      <option value="Second Sitting">Second Sitting (2S)</option>
                      <option value="General">General (GN)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Passengers
                  </label>
                  <div className="relative">
                    <UsersIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={passengers}
                      onChange={(e) => setPassengers(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer appearance-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <option key={num} value={num}>
                          {num} Passenger{num > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* ========== Search Button ========== */}
              <button
                onClick={handleSearch}
                className="w-full py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <SearchIcon size={22} />
                Search Trains
              </button>

              {/* ========== Quick Info ========== */}
              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Real-time availability</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Instant confirmation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Secure payments</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========== Features Section ========== */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: "🚄",
                  title: "10,000+ Trains",
                  desc: "Book tickets for any train across India"
                },
                {
                  icon: "⚡",
                  title: "Instant Booking",
                  desc: "Get confirmed tickets in seconds"
                },
                {
                  icon: "📍",
                  title: "Live Tracking",
                  desc: "Track your train in real-time"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:bg-gray-800/60 transition-all duration-300"
                >
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}