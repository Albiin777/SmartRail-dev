export default function PassengerList({ passengers, setSelected }) {
    return (
        <div className="p-6">
            <h2 className="text-sm text-gray-400 mb-4">
                Passenger List
            </h2>

            {passengers.map(p => (
                <div
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className="bg-[#1a1a1a] border border-gray-700 p-3 mb-2 cursor-pointer hover:bg-[#242424]"
                >
                    {p.name} – {p.coach}-{p.seatNo}
                </div>
            ))}
        </div>
    );
}
