export default function MiniFooter() {
    return (
        <div className="absolute bottom-0 left-0 w-full text-center pb-4 pt-4 text-gray-500 text-[10px] md:text-xs">
            <p className="font-medium tracking-wide">© {new Date().getFullYear()} SmartRail • Intelligent Booking • Smart Travel</p>
        </div>
    );
}
