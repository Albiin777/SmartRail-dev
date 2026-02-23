export default function PassengerPanel({
    passenger,
    verify,
    upgrade
}) {

    if (!passenger)
        return <div className="text-gray-400">Select seat</div>;

    return (
        <div className="space-y-3 text-sm">

            <div>Name: {passenger.name}</div>
            <div>Seat: {passenger.seat || "RAC"}</div>
            <div>Status: {passenger.status}</div>
            <div>Verified: {passenger.verified ? "Yes" : "No"}</div>

            <div className="flex gap-3 mt-4">

                <button
                    onClick={() => verify(passenger.id)}
                    className="bg-green-500 px-3 py-1 rounded"
                >
                    Verify
                </button>

                <button
                    onClick={() => upgrade(passenger.id)}
                    className="bg-yellow-500 px-3 py-1 rounded text-black"
                >
                    Upgrade ₹800
                </button>

            </div>

        </div>
    );
}
