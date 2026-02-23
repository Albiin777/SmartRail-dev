import { useState } from "react";
import { useSmartRail } from "../hooks/useSmartRail";
import { motion } from "framer-motion";
import { FiStar, FiUser, FiTrendingUp } from "react-icons/fi";

export default function ReviewsPage() {
    const { reviews, addReview, passengers } = useSmartRail();
    const [selectedPassenger, setSelectedPassenger] = useState("");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    const ratingDist = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        pct: reviews.length > 0 ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0,
    }));

    const handleSubmitReview = () => {
        if (!selectedPassenger || rating === 0) return;
        addReview(selectedPassenger, rating, comment);
        setSelectedPassenger("");
        setRating(0);
        setComment("");
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-title">Passenger Reviews</h1>
                <p className="page-subtitle">Feedback and ratings from passengers</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Rating Overview */}
                <div className="card-static p-6">
                    <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Rating Overview</h3>

                    <div className="text-center mb-6">
                        <p className="text-5xl font-bold" style={{ color: "var(--text-primary)" }}>{avgRating}</p>
                        <div className="flex justify-center gap-1 my-2">
                            {[1, 2, 3, 4, 5].map(s => (
                                <FiStar
                                    key={s}
                                    size={18}
                                    style={{
                                        color: s <= Math.round(parseFloat(avgRating)) ? "#f59e0b" : "var(--border-dark)",
                                        fill: s <= Math.round(parseFloat(avgRating)) ? "#f59e0b" : "transparent"
                                    }}
                                />
                            ))}
                        </div>
                        <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>{reviews.length} reviews</p>
                    </div>

                    <div className="space-y-2">
                        {ratingDist.map(r => (
                            <div key={r.star} className="flex items-center gap-2 text-[12px]">
                                <span style={{ color: "var(--text-muted)" }}>{r.star}★</span>
                                <div className="flex-1 h-2 rounded-full" style={{ background: "var(--bg-input)" }}>
                                    <div
                                        className="h-2 rounded-full transition-all"
                                        style={{ width: `${r.pct}%`, background: "#f59e0b" }}
                                    />
                                </div>
                                <span className="w-6 text-right" style={{ color: "var(--text-muted)" }}>{r.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Review */}
                <div className="card-static p-6">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <FiTrendingUp size={16} style={{ color: "var(--accent-blue)" }} />
                        Submit Review
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[11px] uppercase tracking-wider font-semibold block mb-1.5" style={{ color: "var(--text-muted)" }}>
                                Passenger Name
                            </label>
                            <select
                                value={selectedPassenger}
                                onChange={e => setSelectedPassenger(e.target.value)}
                                className="input-field w-full"
                            >
                                <option value="">Select passenger...</option>
                                {passengers.map(p => (
                                    <option key={p.id} value={p.name}>{p.name} — {p.coach}-{p.seatNo || "RAC"}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] uppercase tracking-wider font-semibold block mb-1.5" style={{ color: "var(--text-muted)" }}>
                                Rating
                            </label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setRating(s)}
                                        onMouseEnter={() => setHoverRating(s)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="p-1 transition-transform hover:scale-110"
                                    >
                                        <FiStar
                                            size={24}
                                            style={{
                                                color: s <= (hoverRating || rating) ? "#f59e0b" : "var(--border-dark)",
                                                fill: s <= (hoverRating || rating) ? "#f59e0b" : "transparent"
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] uppercase tracking-wider font-semibold block mb-1.5" style={{ color: "var(--text-muted)" }}>
                                Comment
                            </label>
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Write a review..."
                                rows={3}
                                className="input-field w-full resize-none"
                            />
                        </div>

                        <button
                            onClick={handleSubmitReview}
                            disabled={!selectedPassenger || rating === 0}
                            className={`btn w-full py-2.5 justify-center ${selectedPassenger && rating > 0 ? "btn-dark" : ""
                                }`}
                            style={
                                (!selectedPassenger || rating === 0) ? {
                                    background: "var(--bg-input)",
                                    color: "var(--text-muted)",
                                    cursor: "not-allowed"
                                } : {}
                            }
                        >
                            Submit Review
                        </button>
                    </div>
                </div>

                {/* Review Feed */}
                <div className="card-static p-6">
                    <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                        Recent Reviews ({reviews.length})
                    </h3>
                    <div className="space-y-3 max-h-[480px] overflow-y-auto">
                        {reviews.map((r, i) => (
                            <motion.div
                                key={r.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="p-3.5 rounded-xl"
                                style={{ background: "var(--bg-input)", border: "1px solid var(--border-light)" }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-blue-bg)" }}>
                                            <FiUser size={12} style={{ color: "var(--accent-blue)" }} />
                                        </div>
                                        <span className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>{r.passengerName}</span>
                                    </div>
                                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{r.time}</span>
                                </div>
                                <div className="flex gap-0.5 mb-2">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <FiStar
                                            key={s}
                                            size={13}
                                            style={{
                                                color: s <= r.rating ? "#f59e0b" : "var(--border-dark)",
                                                fill: s <= r.rating ? "#f59e0b" : "transparent"
                                            }}
                                        />
                                    ))}
                                </div>
                                <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{r.comment}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
