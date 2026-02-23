export default function AuditPanel({ logs }) {
    return (
        <div className="bg-[#1a1a1a] border-t border-gray-700 p-3 text-xs h-32 overflow-y-auto">
            {logs.map((log, i) => (
                <div key={i} className="text-gray-400">
                    {log}
                </div>
            ))}
        </div>
    );
}
