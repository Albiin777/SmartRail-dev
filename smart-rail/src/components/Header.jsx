export default function Header() {
    return (
        <div className="flex justify-between items-center px-6 py-4 bg-white/5 backdrop-blur-lg border-b border-white/10">
            <div className="text-xl font-semibold tracking-wide">
                SmartRail TT
            </div>
            <div className="text-sm text-gray-300">
                Train 12627 | Coach S3
            </div>
        </div>
    );
}
