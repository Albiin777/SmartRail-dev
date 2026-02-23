export default function CoachSelector({
    coaches,
    selectedCoach,
    setSelectedCoach
}) {
    return (
        <div className="px-4 py-2 border-b border-gray-700 text-xs flex gap-3">
            {coaches.map(coach => (
                <button
                    key={coach}
                    onClick={() => setSelectedCoach(coach)}
                    className={`px-3 py-1 border ${selectedCoach === coach
                            ? "bg-green-700"
                            : "bg-[#2a2a2a]"
                        }`}
                >
                    {coach}
                </button>
            ))}
        </div>
    );
}
