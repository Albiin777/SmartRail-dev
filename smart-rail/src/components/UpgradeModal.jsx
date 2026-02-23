import jsPDF from "jspdf";

export default function UpgradeModal({
    passenger,
    close,
    applyUpgrade
}) {
    if (!passenger) return null;

    const generateBill = () => {
        const doc = new jsPDF();
        doc.text("Smart Rail Upgrade Bill", 20, 20);
        doc.text(`Passenger: ${passenger.name}`, 20, 40);
        doc.text("Upgrade Charge: ₹800", 20, 50);
        doc.save("upgrade_bill.pdf");
    };

    const handleUpgrade = () => {
        applyUpgrade(passenger.id);
        generateBill();
        close();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
            <div className="bg-[#1a1a1a] p-6">
                <h2 className="mb-4">Confirm Upgrade</h2>

                <p>Charge: ₹800</p>

                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleUpgrade}
                        className="bg-green-600 px-3 py-1"
                    >
                        Confirm
                    </button>

                    <button
                        onClick={close}
                        className="bg-gray-700 px-3 py-1"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
