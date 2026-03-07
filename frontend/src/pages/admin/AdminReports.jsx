export default function AdminReports() {
    return (
        <div className="space-y-6 animate-fade-in text-gray-100 font-sans">
            <div className="flex justify-between items-center mb-6 pt-4 px-2">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-3">
                        <span className="text-pink-500 text-3xl">📈</span> Analytics & Reports
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">System-wide performance, revenue, and workload data.</p>
                </div>
                <button className="bg-[#2B2B2B] hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold transition border border-gray-600">
                    Export PDF
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-2">
                <div className="bg-[#1D2332] rounded-2xl border border-white/5 shadow-2xl p-6">
                    <h3 className="font-bold text-white mb-4">Passenger Density (7 Days)</h3>
                    <div className="h-48 w-full flex items-end gap-2 px-2 border-b border-l border-gray-700/50 pb-2">
                        {/* Placeholder Bar Chart */}
                        <div className="w-1/7 bg-blue-500/80 rounded-t h-[40%] flex-1 hover:bg-blue-400 transition-colors"></div>
                        <div className="w-1/7 bg-blue-500/80 rounded-t h-[60%] flex-1 hover:bg-blue-400 transition-colors"></div>
                        <div className="w-1/7 bg-blue-500/80 rounded-t h-[50%] flex-1 hover:bg-blue-400 transition-colors"></div>
                        <div className="w-1/7 bg-blue-500/80 rounded-t h-[80%] flex-1 hover:bg-blue-400 transition-colors"></div>
                        <div className="w-1/7 bg-blue-500/80 rounded-t h-[70%] flex-1 hover:bg-blue-400 transition-colors"></div>
                        <div className="w-1/7 bg-blue-500/80 rounded-t h-[90%] flex-1 hover:bg-blue-400 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>
                        <div className="w-1/7 bg-blue-500/80 rounded-t h-[65%] flex-1 hover:bg-blue-400 transition-colors"></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest mt-2 px-2 font-bold">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span className="text-white">Sat</span><span>Sun</span>
                    </div>
                </div>

                <div className="bg-[#1D2332] rounded-2xl border border-white/5 shadow-2xl p-6">
                    <h3 className="font-bold text-white mb-4">TTE Duty Hours Map</h3>
                    <div className="space-y-3">
                        {/* Placeholder Progress Bars */}
                        <div>
                            <div className="flex justify-between text-xs mb-1 font-bold text-gray-300"><span>Rajesh Kumar (CAN)</span><span>36 / 40 hrs</span></div>
                            <div className="w-full bg-gray-800 rounded-full h-2"><div className="bg-pink-500 h-2 rounded-full" style={{ width: '90%' }}></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1 font-bold text-gray-300"><span>Sumedh Menon (ERS)</span><span>20 / 40 hrs</span></div>
                            <div className="w-full bg-gray-800 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }}></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1 font-bold text-gray-300"><span>Mohammed Ali (SRR)</span><span className="text-red-400">45 / 40 hrs (OT)</span></div>
                            <div className="w-full bg-gray-800 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{ width: '100%' }}></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
