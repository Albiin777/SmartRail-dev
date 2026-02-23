import { motion } from "framer-motion";

export default function SleeperLayout({ passengers, setSelected }) {

    const getPassenger = (seat) =>
        passengers.find(p => p.seat === seat);

    const getColor = (seat) => {
        const p = getPassenger(seat);
        if (!p) return "bg-white/10";
        if (p.verified) return "bg-green-500/80";
        if (p.status === "RAC") return "bg-yellow-400/80";
        return "bg-red-500/80";
    };

    return (
        <div className="space-y-6">

            {Array.from({ length: 5 }, (_, bay) => {
                const start = bay * 8 + 1;

                return (
                    <div key={bay} className="flex justify-between">

                        {/* 6 Main */}
                        <div className="grid grid-cols-3 gap-3">
                            {[0, 1, 2, 3, 4, 5].map(i => {
                                const seat = start + i;
                                return (
                                    <motion.div
                                        key={seat}
                                        whileHover={{
                                            scale: 1.08,
                                            boxShadow: "0 0 18px rgba(255,255,255,0.4)"
                                        }}
                                        onClick={() =>
                                            setSelected(getPassenger(seat))
                                        }
                                        className={`${getColor(seat)} h-12 w-12 rounded-xl flex items-center justify-center cursor-pointer`}
                                    >
                                        {seat}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Side */}
                        <div className="grid grid-rows-2 gap-3">
                            {[6, 7].map(i => {
                                const seat = start + i;
                                return (
                                    <motion.div
                                        key={seat}
                                        whileHover={{
                                            scale: 1.08,
                                            boxShadow: "0 0 18px rgba(255,255,255,0.4)"
                                        }}
                                        onClick={() =>
                                            setSelected(getPassenger(seat))
                                        }
                                        className={`${getColor(seat)} h-12 w-12 rounded-xl flex items-center justify-center cursor-pointer`}
                                    >
                                        {seat}
                                    </motion.div>
                                );
                            })}
                        </div>

                    </div>
                );
            })}

        </div>
    );
}
