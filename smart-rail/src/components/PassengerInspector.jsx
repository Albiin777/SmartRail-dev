export default function PassengerInspector({
    passenger,
    verify,
    penalty,
    openQR
}) {

    if (!passenger)
        return (
            <div className="p-4 text-gray-500 text-xs">
                Select seat
            </div>
        );

    return (
        <div className="p-4 text-xs space-y-2 border-l border-gray-700">

            <div className="font-semibold border-b border-gray-700 pb-1">
                Passenger
            </div>

            <div>Name: {passenger.name}</div>
            <div>Seat: {passenger.seatNo || "RAC"}</div>
            <div>Status: {passenger.status}</div>
            <div>Verified: {passenger.verified ? "YES" : "NO"}</div>

            <div className="flex gap-2 mt-3">
                <button
                    onClick={() => verify(passenger.id)}
                    className="bg-[#2f5d3c] px-2 py-1 border"
                >
                    Verify
                </button>

                <button
                    onClick={() => penalty(passenger)}
                    className="bg-[#5d3c2f] px-2 py-1 border"
                >
                    Penalty
                </button>

                <button
                    onClick={openQR}
                    className="bg-[#333] px-2 py-1 border"
                >
                    Scan QR
                </button>
            </div>

        </div>
    );
}
