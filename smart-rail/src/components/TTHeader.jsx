export default function TTHeader({ time }) {
    return (
        <div className="bg-[#1a1a1a] border-b border-gray-700 px-6 py-4 flex justify-between items-center">
            <div>
                <h1 className="text-lg font-semibold">
                    🚆 Smart Rail – TT Enterprise System
                </h1>
                <p className="text-xs text-gray-400">
                    Train 12627 | 19 Feb 2026
                </p>
            </div>

            <div className="text-xs text-gray-400 text-right">
                <p>{time}</p>
                <p className="text-green-400">Device Online</p>
            </div>
        </div>
    );
}
