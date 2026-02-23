export default function FilterBar({
    coaches,
    classes,
    selectedCoach,
    selectedClass,
    setSelectedCoach,
    setSelectedClass
}) {
    return (
        <div className="flex gap-4 p-4 border-b border-gray-700 bg-[#242424] text-sm">

            <div>
                <label className="text-gray-400 mr-2">Coach:</label>
                <select
                    value={selectedCoach}
                    onChange={e => setSelectedCoach(e.target.value)}
                    className="bg-[#1a1a1a] border border-gray-700 px-2 py-1"
                >
                    <option value="ALL">All</option>
                    {coaches.map(c => (
                        <option key={c}>{c}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="text-gray-400 mr-2">Class:</label>
                <select
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    className="bg-[#1a1a1a] border border-gray-700 px-2 py-1"
                >
                    <option value="ALL">All</option>
                    {classes.map(c => (
                        <option key={c}>{c}</option>
                    ))}
                </select>
            </div>

        </div>
    );
}
