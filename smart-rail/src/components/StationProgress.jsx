export default function StationProgress({
    stations,
    currentIndex,
    nextStation
}) {
    return (
        <div className="bg-[#202020] px-4 py-2 border-b border-gray-700 text-xs">

            <div className="flex gap-2 overflow-x-auto">
                {stations.map((s, i) => (
                    <div
                        key={s}
                        className={`px-2 py-1 border ${i === currentIndex
                                ? "bg-green-700"
                                : "bg-[#2a2a2a]"
                            }`}
                    >
                        {s}
                    </div>
                ))}
            </div>

            <button
                onClick={nextStation}
                className="mt-2 bg-[#333] px-2 py-1 border border-gray-600"
            >
                Arrived at Next Station
            </button>

        </div>
    );
}
