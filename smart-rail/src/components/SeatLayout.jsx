export default function SeatLayout({ passengers, setSelected }) {

    const seats = Array.from({ length: 40 }, (_, i) => i + 1);

    const getPassenger = seat =>
        passengers.find(p => p.seatNo === seat);

    const getColor = seat => {
        const p = getPassenger(seat);
        if (!p) return "bg-gray-700";
        if (p.verified) return "bg-green-600";
        return "bg-red-600";
    };

    return (
        <div className="p-6">
            <h2 className="text-sm text-gray-400 mb-4">
                Seat Layout
            </h2>

            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {seats.map(seat => (
                    <div
                        key={seat}
                        onClick={() => {
                            const p = getPassenger(seat);
                            if (p) setSelected(p);
                        }}
                        className={`${getColor(seat)} h-12 flex items-center justify-center cursor-pointer`}
                    >
                        {seat}
                    </div>
                ))}
            </div>
        </div>
    );
}
const getHeatColor = (seat, passengers) => {
  const p = passengers.find(x => x.seat === seat);

  if (!p) return "bg-blue-500/30";
  if (p.verified) return "bg-green-500/80";
  if (p.status === "RAC") return "bg-yellow-400/80";
  return "bg-red-500/80";
};
