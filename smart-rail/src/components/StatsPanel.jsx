export default function StatsPanel({ passengers }) {
    const total = passengers.length;
    const verified = passengers.filter(p => p.verified).length;
    const rac = passengers.filter(p => p.status === "RAC").length;

    return (
        <div className="grid grid-cols-3 gap-4 p-4">
            <Card title="Total" value={total} />
            <Card title="Verified" value={verified} />
            <Card title="RAC" value={rac} />
        </div>
    );
}

function Card({ title, value }) {
    return (
        <div className="bg-[#1a1a1a] border border-gray-700 p-4 text-center">
            <p className="text-xs text-gray-400">{title}</p>
            <h2 className="text-lg">{value}</h2>
        </div>
    );
}
