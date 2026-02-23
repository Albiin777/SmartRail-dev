export default function TopActions() {
    return (
        <div className="flex flex-wrap gap-3 p-4 bg-[#242424] border-b border-gray-700">

            <button className="bg-blue-600 px-4 py-1 text-sm">
                PNR Search
            </button>

            <button className="bg-purple-600 px-4 py-1 text-sm">
                Scan QR
            </button>

            <button className="bg-yellow-600 px-4 py-1 text-sm">
                Penalty
            </button>

            <button className="bg-gray-700 px-4 py-1 text-sm">
                RAC Upgrade
            </button>

            <button className="bg-gray-700 px-4 py-1 text-sm">
                Reports
            </button>

        </div>
    );
}
