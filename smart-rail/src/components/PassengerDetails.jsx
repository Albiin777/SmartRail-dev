export default function PassengerDetails({
    passenger,
    openUpgrade
}) {
    if (!passenger)
        return (
            <div className="bg-[#1a1a1a] p-4 border border-gray-700">
                Select Passenger
            </div>
        );

    return (
        <div className="bg-[#1a1a1a] p-4 border border-gray-700">
            <p>Name: {passenger.name}</p>
            <p>Coach: {passenger.coach}</p>
            <p>Seat: {passenger.seatNo}</p>
            <p>Status: {passenger.status}</p>

            <button
                onClick={openUpgrade}
                className="bg-yellow-600 mt-4 px-3 py-1"
            >
                Upgrade (Extra Charge)
            </button>
        </div>
    );
}
