import Hero from "../components/Hero";
import BookingCard from "../components/Bookingcaard";
import Pnrstatus from "../components/Pnrstatus";
import Reviews from "../components/Reviews";
import Support from "./Support";

export default function Home() {
    return (
        <>
            <Hero />
            <BookingCard />
            <div id="pnr-section" className="scroll-mt-[190px]">
                <Pnrstatus />
            </div>
            <div id="reviews-section" className="scroll-mt-[140px]">
                <Reviews />
            </div>
            <Support autoScroll={false} />
        </>
    );
}
