import CountUp from "react-countup";

export default function StatsBar({ passengers, revenue }) {

    const total = 40;
    const verified = passengers.filter(p => p.verified).length;
    const rac = passengers.filter(p => p.status === "RAC").length;

    return (
        <div className="grid grid-cols-3 gap-4 text-center text-sm">

            <div className="bg-white/10 rounded-xl p-4">
                <div className="text-gray-300">Verified</div>
                <div className="text-xl font-semibold text-green-400">
                    <CountUp end={verified} duration={1} />
                </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
                <div className="text-gray-300">RAC</div>
                <div className="text-xl font-semibold text-yellow-400">
                    <CountUp end={rac} duration={1} />
                </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
                <div className="text-gray-300">Revenue ₹</div>
                <div className="text-xl font-semibold text-blue-400">
                    <CountUp end={revenue} duration={1} />
                </div>
            </div>

        </div>
    );
}
