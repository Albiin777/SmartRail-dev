export default function PenaltyModal({ passenger, close, addPenalty }) {
    if (!passenger) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-white text-black p-6">
                <h2>Generate Penalty</h2>
                <button onClick={() => addPenalty(passenger, 500)}>₹500 Fine</button>
                <button onClick={close}>Close</button>
            </div>
        </div>
    );
}
