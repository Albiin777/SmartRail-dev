import { useState, useEffect } from "react";
import { Star, Search, ThumbsUp, CheckCircle2, Plus, X, ThumbsDown, Pencil, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function Reviews() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedImageIndex, setSelectedImageIndex] = useState(0); // Track numerical index
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [trainName, setTrainName] = useState("");
    const [hasSearched, setHasSearched] = useState(false); // Track initial state
    const [startAnimation, setStartAnimation] = useState(false); // For animation triggering
    const [user, setUser] = useState(null);



    useEffect(() => {
        // Get current user
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Only actual review images + data
    const reviewsWithImages = [
        { id: 1, name: "Rahul Verma", date: "2 days ago", rating: 5, text: "Absolutely loved the Vande Bharat experience! The cleanliness is unmatched and the food was delicious.", reviewImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Vande_Bharat_Express_at_Howrah.jpg/1200px-Vande_Bharat_Express_at_Howrah.jpg", image: "https://randomuser.me/api/portraits/men/32.jpg", verified: true, likes: 124, dislikes: 2, userAction: null },
        { id: 2, name: "Priya Singh", date: "1 week ago", rating: 4, text: "Great journey, very punctual. The wifi was a bit spotty in some areas but overall a very comfortable ride.", reviewImage: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop", image: "https://randomuser.me/api/portraits/women/44.jpg", verified: true, likes: 45, dislikes: 0, userAction: null },
        { id: 4, name: "Sneha Gupta", date: "3 weeks ago", rating: 5, text: "Best train journey in India so far. The seats are very comfortable.", reviewImage: "https://img.freepik.com/premium-photo/interior-modern-train-with-empty-seats_1048944-19602.jpg", image: "https://randomuser.me/api/portraits/women/65.jpg", verified: true, likes: 30, dislikes: 0, userAction: null },
        { id: 5, name: "Vikram Malhotra", date: "1 month ago", rating: 4, text: "Good food options.", reviewImage: "https://images.unsplash.com/photo-1515165592879-18497881c97a?q=80&w=800&auto=format&fit=crop", image: "https://randomuser.me/api/portraits/men/45.jpg", verified: true, likes: 12, dislikes: 0, userAction: null }
    ];

    const [reviews, setReviews] = useState([
        ...reviewsWithImages,
        { id: 3, name: "Amit Patel", date: "2 weeks ago", rating: 5, text: "Safety protocols were impressive. Felt very secure traveling with family. The automatic doors are great.", reviewImage: null, image: "https://randomuser.me/api/portraits/men/11.jpg", verified: true, likes: 89, dislikes: 1, userAction: null }
    ]);

    // Gallery state
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Filter only images for the gallery strip
    const galleryItems = reviews.flatMap(r => {
        if (!r.reviewImage && (!r.reviewImages || r.reviewImages.length === 0)) return [];
        if (r.reviewImages && r.reviewImages.length > 0) {
            return r.reviewImages.map((img, idx) => ({ ...r, reviewImage: img, id: `${r.id}-${idx}`, originalId: r.id }));
        }
        return [r];
    });

    const [newReview, setNewReview] = useState({
        name: "",
        rating: 5,
        text: "",
        reviewImages: [],
        ratings: {
            cleanliness: 5,
            safety: 5,
            comfort: 5,
            schedule: 5,
            staff: 5
        }
    });



    const handleSearch = () => {
        if (!searchQuery.trim()) return;
        setTrainName(searchQuery);
        setHasSearched(true);
        setTimeout(() => setStartAnimation(true), 100);
    };

    const openLightbox = (index) => {
        setSelectedImageIndex(index);
        setIsLightboxOpen(true);
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setSelectedImageIndex((prev) => (prev + 1) % galleryItems.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setSelectedImageIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
    };

    // Keyboard arrow key navigation for lightbox
    useEffect(() => {
        if (!isLightboxOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') {
                setSelectedImageIndex((prev) => (prev + 1) % galleryItems.length);
            } else if (e.key === 'ArrowLeft') {
                setSelectedImageIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
            } else if (e.key === 'Escape') {
                setIsLightboxOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, galleryItems.length]);

    const ratings = [
        { label: "Cleanliness", score: 4.8, color: "bg-emerald-500" },
        { label: "Safety", score: 4.9, color: "bg-blue-500" },
        { label: "Comfort", score: 4.7, color: "bg-amber-500" },
        { label: "Schedule", score: 4.5, color: "bg-violet-500" },
        { label: "Staff", score: 4.6, color: "bg-rose-500" },
    ];

    const getRatingColor = (score) => {
        if (score >= 4.0) return "text-green-500";
        if (score >= 2.5) return "text-orange-500";
        return "text-red-500";
    };

    const handleLike = (id, isLike) => {
        const updatedReviews = reviews.map(review => {
            if (review.id !== id) return review;
            let newLikes = review.likes;
            let newDislikes = review.dislikes;
            let newAction = review.userAction;

            if (isLike) {
                if (review.userAction === 'like') { newLikes--; newAction = null; }
                else { newLikes++; newAction = 'like'; if (review.userAction === 'dislike') newDislikes--; }
            } else {
                if (review.userAction === 'dislike') { newDislikes--; newAction = null; }
                else { newDislikes++; newAction = 'dislike'; if (review.userAction === 'like') newLikes--; }
            }
            return { ...review, likes: newLikes, dislikes: newDislikes, userAction: newAction };
        });
        setReviews(updatedReviews);
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();

        if (!newReview.name.trim() || !newReview.text.trim()) {
            return;
        }

        // Calculate average rating from categories
        const avgRating = Math.round(
            (Object.values(newReview.ratings).reduce((a, b) => a + b, 0) / 5) * 10
        ) / 10;

        const newEntry = {
            id: reviews.length + 1,
            name: newReview.name || "Anonymous User",
            date: "Just now",
            rating: avgRating,
            text: newReview.text,
            reviewImages: newReview.reviewImages, // Store array of images
            reviewImage: newReview.reviewImages[0] || null, // Store first image as thumbnail
            image: "https://randomuser.me/api/portraits/lego/1.jpg",
            verified: true,
            likes: 0,
            dislikes: 0,
            userAction: null,
            categoryRatings: newReview.ratings
        };
        setReviews([newEntry, ...reviews]);
        setNewReview({
            name: "",
            rating: 5,
            text: "",
            reviewImages: [],
            ratings: { cleanliness: 5, safety: 5, comfort: 5, schedule: 5, staff: 5 }
        });
        setIsModalOpen(false);
    };

    if (!hasSearched) {
        return (
            <div className="w-full max-w-4xl mx-auto mt-8 mb-[2px] px-4 py-28 text-center animate-in fade-in duration-700">
                <div className="bg-[#1D2332] p-10 rounded-3xl relative overflow-hidden group">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-4 relative z-10">
                        SmartRail Reviews Hub
                    </h2>
                    <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto relative z-10">
                        SmartRail Reviews Hub, search for a train name or number to see reviews, ratings, and traveler photos.
                    </p>

                    <div className="relative max-w-lg mx-auto z-10">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Enter train name or number..."
                            className="w-full pl-6 pr-14 py-4 bg-[#1D2332] border border-white/20 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all text-lg"
                        />
                        <button
                            onClick={handleSearch}
                            className="absolute right-2 top-2 bottom-2 aspect-square bg-white hover:bg-slate-200 text-black rounded-xl flex items-center justify-center transition-colors"
                        >
                            <Search className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative w-full max-w-6xl mx-auto mt-8 mb-20 px-4 transition-all duration-700 ${startAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

            {/* HEADER SECTION */}
            <div className="mb-8 pl-2">
                <div className="mb-6">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white drop-shadow-sm mb-2">Trains & Reviews</h2>
                    <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed max-w-2xl ml-1">
                        Your journey matters. Share your experience and help shape better travels.
                    </p>
                </div>

                <div className="h-px bg-white/10 w-full mb-6"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest block mb-1">Viewing Reviews For</span>
                        <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">{trainName}</h3>
                    </div>

                    <button
                        onClick={() => { setHasSearched(false); setSearchQuery(""); }}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider px-4 py-2.5"
                    >
                        <Search className="w-4 h-4" /> Search Another
                    </button>
                </div>
            </div>

            {/* TRAIN INFO HEADER (Now part of the main card or simplified) */}

            {/* MAIN CONTENT - HEIGHT SYNCED */}
            <div className="bg-[#1D2332] rounded-[28px] flex flex-col lg:flex-row overflow-hidden">

                {/* LEFT: VISUALS (Fixed Content) */}
                <div className="flex-1 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#1D2332] flex flex-col gap-4">
                    {/* MAIN IMAGE */}
                    <div className="aspect-video w-full rounded-2xl overflow-hidden relative group cursor-pointer bg-black/40">
                        {galleryItems.length > 0 ? (
                            <img
                                src={galleryItems[0].reviewImage}
                                alt="Main Interior"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                onClick={() => openLightbox(0)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                                <ImageIcon className="w-12 h-12" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 pointer-events-none">
                            <p className="text-white text-xs font-medium line-clamp-1 italic">"{galleryItems[0]?.text}"</p>
                        </div>
                    </div>

                    {/* IMAGE GRID */}
                    {galleryItems.length > 1 && (
                        <div className="grid grid-cols-3 gap-2 h-24">
                            {galleryItems.slice(1, 4).map((item, idx) => {
                                const realIndex = idx + 1;
                                const isLastItem = idx === 2; // 3rd item (index 2) in the slice is the 4th image total
                                const remainingCount = galleryItems.length - 4; // Total - (1 main + 3 in grid)

                                return (
                                    <div
                                        key={item.id}
                                        className="relative rounded-lg overflow-hidden cursor-pointer h-full group bg-black/40"
                                        onClick={() => openLightbox(realIndex)}
                                    >
                                        <img src={item.reviewImage} alt={`View ${realIndex}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />

                                        {/* OPTIONAL: Overlay on the last item if there are more images hidden */}
                                        {isLastItem && remainingCount > 0 && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px] transition-colors hover:bg-black/70">
                                                <span className="text-white font-bold text-sm tracking-widest pl-1">+{remainingCount} MORE</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <button
                        onClick={() => openLightbox(0)}
                        className="w-full py-3 mt-auto rounded-xl bg-white text-black hover:bg-slate-200 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
                    >
                        <ImageIcon className="w-4 h-4 group-hover:scale-110 transition-transform" /> View Gallery
                    </button>
                </div>

                {/* RIGHT: RATINGS & REVIEWS (Flexbox to eliminate gaps) */}
                <div className="flex-1 flex flex-col bg-[#1D2332] h-full">

                    {/* RATINGS HEADER */}
                    <div className="px-6 py-4 md:px-8 md:py-6 border-b border-white/10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Overall Ratings
                            </h3>
                            {user ? (
                                <button onClick={() => {
                                    setNewReview(prev => ({ ...prev, name: user.user_metadata?.full_name || user.email?.split('@')[0] || "" }));
                                    setIsModalOpen(true);
                                }} className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-200 text-black rounded-lg font-bold text-[10px] uppercase transition-all shadow-lg active:scale-95">
                                    <Plus className="w-3 h-3" /> Add Review
                                </button>
                            ) : null}
                        </div>
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            {ratings.map((stat, idx) => {
                                const score = Number(stat.score);
                                const barColor = score >= 4.0 ? "bg-green-500" : score >= 2.5 ? "bg-orange-500" : "bg-red-500";
                                const textColor = getRatingColor(score);
                                return (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                                            <span className="text-white/60">{stat.label}</span>
                                            <span className={textColor}>{stat.score}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div className={`h-full ${barColor} rounded-full`} style={{ width: `${(score / 5) * 100}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* SCROLLABLE USER REVIEWS - Show ~3 items (approx 360px) */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-[#1D2332] max-h-[320px] md:max-h-[460px]">
                        {reviews.map((review) => (
                            <div key={review.id} className="p-4 rounded-xl bg-[#1D2332] border border-white/5 transition-all group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <h4 className="text-sm font-bold text-white flex items-center gap-1 group-hover:text-amber-400 transition-colors">
                                                {review.name}
                                                {review.verified && <CheckCircle2 className="w-3 h-3 text-cyan-400" />}
                                                <span className="text-[10px] text-slate-500 font-normal ml-1">• {review.date}</span>
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-md border border-white/10">
                                        <span className={`text-xs font-black ${getRatingColor(review.rating)}`}>{review.rating}</span>
                                        <Star className={`w-3 h-3 fill-current ${getRatingColor(review.rating)}`} />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed italic mb-3 pl-1 border-l-2 border-white/10 py-1">"{review.text}"</p>

                                {/* Only show image if review has one */}
                                {review.reviewImages && review.reviewImages.length > 0 && (
                                    <div className="flex gap-2 mb-3 overflow-x-auto custom-scrollbar pb-2">
                                        {review.reviewImages.map((img, idx) => {
                                            // Find index in flatten gallery
                                            // If flatten works, ID is `id-idx`
                                            const galleryIndex = galleryItems.findIndex(g => g.id === `${review.id}-${idx}`);

                                            return (
                                                <div
                                                    key={idx}
                                                    className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition-all border border-white/10 hover:border-white/30"
                                                    onClick={() => {
                                                        if (galleryIndex !== -1) openLightbox(galleryIndex);
                                                    }}
                                                >
                                                    <img src={img} alt={`Review attachment ${idx}`} className="w-full h-full object-cover" />
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                                {/* Legacy support for single image */}
                                {!review.reviewImages && review.reviewImage && (
                                    <div
                                        className="mb-3 w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition-all"
                                        onClick={() => {
                                            const idx = galleryItems.findIndex(g => g.id === review.id);
                                            if (idx !== -1) openLightbox(idx);
                                        }}
                                    >
                                        <img src={review.reviewImage} alt="Review attachment" className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mt-auto pt-2 border-t border-white/10">
                                    <button
                                        onClick={() => handleLike(review.id, true)}
                                        className={`flex items-center gap-1.5 text-[10px] font-bold py-1 px-2 rounded-lg transition-all ${review.userAction === 'like'
                                            ? 'bg-white/20 text-white border border-white/20'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                            }`}
                                    >
                                        <ThumbsUp className={`w-3 h-3 ${review.userAction === 'like' ? 'fill-current' : ''}`} />
                                        <span>{review.likes}</span>
                                    </button>

                                    <button
                                        onClick={() => handleLike(review.id, false)}
                                        className={`flex items-center gap-1.5 text-[10px] font-bold py-1 px-2 rounded-lg transition-all ${review.userAction === 'dislike'
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                            }`}
                                    >
                                        <ThumbsDown className={`w-3 h-3 ${review.userAction === 'dislike' ? 'fill-current' : ''}`} />
                                        <span>{review.dislikes}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>


                </div>
            </div>

            {/* ADD REVIEW MODAL - Viewport Scrolling */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm">
                    <div className="min-h-full flex items-center justify-center p-4">
                        <div className="relative w-full max-w-lg bg-[#1D2332] rounded-2xl border border-white/10 shadow-2xl my-8 flex flex-col">
                            {/* Header & Close Button */}
                            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#1D2332] rounded-t-2xl">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Plus className="w-6 h-6 text-white" /> Write a Review
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-transparent border border-white/20 text-slate-200 hover:bg-red-500 hover:text-white hover:border-red-500 p-2 rounded-full transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form Content - Natural Height */}
                            <div className="p-6">
                                <form onSubmit={handleSubmitReview} className="space-y-6">

                                    {/* Name Field */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Your Name</label>
                                        <input
                                            type="text"
                                            value={newReview.name}
                                            readOnly={!!user}
                                            onChange={(e) => !user && setNewReview({ ...newReview, name: e.target.value })}
                                            className={`w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-white transition-colors ${user ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            placeholder="Enter your name"
                                        />
                                    </div>

                                    {/* Category Ratings */}
                                    <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-white/10 pb-2">Rate Categories</label>
                                        {Object.keys(newReview.ratings).map((category) => (
                                            <div key={category} className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-white capitalize w-24">{category}</span>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setNewReview({
                                                                ...newReview,
                                                                ratings: { ...newReview.ratings, [category]: star }
                                                            })}
                                                            className={`transition-transform hover:scale-110 p-1 ${star <= newReview.ratings[category] ? 'text-yellow-400' : 'text-slate-600'}`}
                                                        >
                                                            <Star className="w-5 h-5 fill-current" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Review Text */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Review</label>
                                        <textarea
                                            value={newReview.text}
                                            onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                                            className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-500 h-24 resize-none focus:outline-none focus:border-white transition-colors"
                                            placeholder="Share your experience..."
                                        />
                                    </div>

                                    {/* Image Upload (Max 5) */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Add Photos (Max 5)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {newReview.reviewImages.map((img, idx) => (
                                                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden group border border-white/10">
                                                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updatedImages = newReview.reviewImages.filter((_, i) => i !== idx);
                                                            setNewReview({ ...newReview, reviewImages: updatedImages });
                                                        }}
                                                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                                    >
                                                        <X className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            ))}

                                            {newReview.reviewImages.length < 5 && (
                                                <label className="w-20 h-20 rounded-xl border border-dashed border-slate-600 hover:border-white/50 bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer transition-all group">
                                                    <ImageIcon className="w-8 h-8 text-slate-500 group-hover:text-white transition-colors" />
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const files = Array.from(e.target.files);
                                                            if (files.length > 0) {
                                                                const remainingSlots = 5 - newReview.reviewImages.length;
                                                                const filesToProcess = files.slice(0, remainingSlots);

                                                                Promise.all(filesToProcess.map(file => {
                                                                    return new Promise((resolve) => {
                                                                        const reader = new FileReader();
                                                                        reader.onloadend = () => resolve(reader.result);
                                                                        reader.readAsDataURL(file);
                                                                    });
                                                                })).then(images => {
                                                                    setNewReview(prev => ({
                                                                        ...prev,
                                                                        reviewImages: [...prev.reviewImages, ...images]
                                                                    }));
                                                                });
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    {newReview.text.trim().length > 0 && (
                                        <button type="submit" className="w-full bg-white hover:bg-slate-200 text-black font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg">
                                            Submit Review
                                        </button>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* LIGHTBOX MODAL */}
            {isLightboxOpen && galleryItems.length > 0 && (
                <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
                    <button onClick={() => setIsLightboxOpen(false)} className="fixed top-6 right-6 text-white/50 hover:text-white transition-colors z-50">
                        <X className="w-8 h-8" />
                    </button>

                    <button onClick={prevImage} className="fixed left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-50 hidden md:block">
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <button onClick={nextImage} className="fixed right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-50 hidden md:block">
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    <div className="min-h-full w-full flex flex-col items-center justify-center p-4 md:p-10">
                        <div className="relative max-w-5xl w-full flex items-center justify-center mb-6">
                            <img
                                src={galleryItems[selectedImageIndex].reviewImage}
                                className="max-w-full max-h-[70vh] object-contain rounded-md shadow-2xl"
                                alt="Gallery View"
                            />
                        </div>

                        {/* Caption Container */}
                        <div className="max-w-2xl text-center pb-10">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <span className="text-white font-bold text-lg">{galleryItems[selectedImageIndex].name}</span>
                                <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded border border-white/20">
                                    <span className="text-sm font-bold text-green-400">{galleryItems[selectedImageIndex].rating}</span>
                                    <Star className="w-3 h-3 fill-green-400 text-green-400" />
                                </div>
                            </div>
                            <p className="text-slate-300 font-medium italic text-lg leading-relaxed">
                                "{galleryItems[selectedImageIndex].text}"
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            `}</style>
        </div>
    );
}