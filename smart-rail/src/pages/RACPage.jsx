import { useSmartRail } from "../hooks/useSmartRail";
import { motion } from "framer-motion";
import { FiArrowUpCircle, FiCheck, FiUser } from "react-icons/fi";

export default function RACPage() {
    const { passengers, upgradeRAC } = useSmartRail();

    const racPassengers = passengers.filter(p => p.status === "RAC");
    const coachPassengers = passengers.filter(p => p.coach === "S3");
    const occupiedSeats = coachPassengers.filter(p => p.seatNo).map(p => p.seatNo);
    const allSeats = Array.from({ length: 40 }, (_, i) => i + 1);
    const emptySeats = allSeats.filter(s => !occupiedSeats.includes(s));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-title">RAC Upgrades</h1>
                <p className="page-subtitle">Manage RAC passengers and seat upgrades</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="stat-card amber">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>RAC Passengers</p>
                    <p className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{racPassengers.length}</p>
                </div>
                <div className="stat-card green">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Empty Seats (S3)</p>
                    <p className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{emptySeats.length}</p>
                </div>
                <div className="stat-card blue">
                    <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Upgrade Fee</p>
                    <p className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>₹800</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* RAC Passenger List */}
                <div className="card-static p-6">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <FiUser size={16} style={{ color: "var(--accent-amber)" }} />
                        RAC Passengers
                    </h3>

                    {racPassengers.length === 0 ? (
                        <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
                            <FiCheck size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">All passengers have confirmed seats</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {racPassengers.map(p => (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-between p-4 rounded-xl"
                                    style={{ background: "var(--bg-input)", border: "1px solid var(--border-light)" }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-amber-bg)" }}>
                                            <FiUser size={16} style={{ color: "var(--accent-amber)" }} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-[13px]" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                                            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                                                {p.boarding} → {p.destination} • {p.coach}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => upgradeRAC(p.id)}
                                        className="btn btn-dark text-sm"
                                        disabled={emptySeats.length === 0}
                                    >
                                        <FiArrowUpCircle size={14} /> Upgrade
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Empty Seats Grid */}
                <div className="card-static p-6">
                    <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                        Available Seats — Coach S3
                    </h3>
                    <div className="grid grid-cols-8 gap-2">
                        {allSeats.map(seat => {
                            const isEmpty = emptySeats.includes(seat);
                            return (
                                <div
                                    key={seat}
                                    className={`seat-cell text-[11px] ${isEmpty ? "seat-empty" : "seat-verified"
                                        }`}
                                    style={{ cursor: "default", opacity: isEmpty ? 1 : 0.5 }}
                                >
                                    {seat}
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex gap-6 mt-4 pt-3 text-[11px]" style={{ borderTop: "1px solid var(--border-light)", color: "var(--text-muted)" }}>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded seat-empty" /> Available
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded seat-verified" style={{ opacity: 0.5 }} /> Occupied
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
