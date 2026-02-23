export default function Navbar({ activeView, setActiveView }) {
    return (
        <div className="bg-[#1a1a1a] border-b border-gray-700 flex text-sm">
            <button
                onClick={() => setActiveView("list")}
                className={`px-6 py-3 ${activeView === "list"
                        ? "border-b-2 border-green-500"
                        : ""
                    }`}
            >
                FULL PASSENGER LIST
            </button>

            <button
                onClick={() => setActiveView("layout")}
                className={`px-6 py-3 ${activeView === "layout"
                        ? "border-b-2 border-green-500"
                        : ""
                    }`}
            >
                SEAT LAYOUT
            </button>
        </div>
    );
}
