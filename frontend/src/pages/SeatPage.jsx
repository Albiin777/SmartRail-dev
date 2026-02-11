import { useState } from "react";
import trains from "../data/trains.json";

export default function SeatLayout({ trainNumber, classType }) {

  const train = trains.find(t => t.number === trainNumber);
  const coachData = train?.classes[classType];

  const totalSeats = coachData.total;
  const bookedSeats = coachData.booked;

  const seats = Array.from({ length: totalSeats }, (_, i) => i + 1);
  const booked = seats.slice(0, bookedSeats);

  const [selected, setSelected] = useState([]);

  const toggleSeat = (seat) => {
    if (booked.includes(seat)) return;

    if (selected.includes(seat)) {
      setSelected(selected.filter(s => s !== seat));
    } else {
      setSelected([...selected, seat]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#111827] text-white p-10">

      <h2 className="text-2xl font-bold mb-8">
        Coach Layout – {classType}
      </h2>

      <div className="grid grid-cols-8 gap-4 max-w-4xl">

        {seats.map(seat => {
          const isBooked = booked.includes(seat);
          const isSelected = selected.includes(seat);

          return (
            <div
              key={seat}
              onClick={() => toggleSeat(seat)}
              className={`h-12 flex items-center justify-center rounded-lg cursor-pointer text-sm font-semibold transition
                ${isBooked
                  ? "bg-red-500 cursor-not-allowed"
                  : isSelected
                  ? "bg-blue-500"
                  : "bg-green-500 hover:bg-green-600"
                }`}
            >
              {seat}
            </div>
          );
        })}

      </div>
    </div>
  );
}