import jsPDF from "jspdf";

function generateReceiptId() {
    return "RCT-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
}

function drawQRPlaceholder(doc, x, y, size, text) {
    // Draw a QR-code-like box with data encoded as text
    doc.setDrawColor(0);
    doc.setLineWidth(1);
    doc.rect(x, y, size, size);

    // Inner pattern (simulated QR)
    doc.setFontSize(5);
    const lines = text.match(/.{1,12}/g) || [text];
    lines.forEach((line, i) => {
        if (i < 6) doc.text(line, x + 2, y + 6 + i * 4);
    });

    // Corner squares (QR-style)
    const cs = 6;
    doc.setFillColor(0);
    doc.rect(x + 1, y + 1, cs, cs, "F");
    doc.rect(x + size - cs - 1, y + 1, cs, cs, "F");
    doc.rect(x + 1, y + size - cs - 1, cs, cs, "F");
    doc.setFillColor(255);
    doc.rect(x + 2.5, y + 2.5, cs - 3, cs - 3, "F");
    doc.rect(x + size - cs + 0.5, y + 2.5, cs - 3, cs - 3, "F");
    doc.rect(x + 2.5, y + size - cs + 0.5, cs - 3, cs - 3, "F");
}

export const generatePenaltyPDF = (passenger, amount, ttInfo = {}) => {
    const doc = new jsPDF();
    const receiptId = generateReceiptId();
    const timestamp = new Date().toLocaleString("en-IN");
    const trainNo = ttInfo.trainNo || "12627";
    const ttId = ttInfo.employeeId || "TT4582";
    const ttName = ttInfo.ttName || "R. Kumar";
    const coach = passenger.coach || "—";
    const station = ttInfo.currentStation || "—";

    // Header
    doc.setFillColor(26, 35, 50);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255);
    doc.setFontSize(18);
    doc.text("SMART RAIL", 15, 16);
    doc.setFontSize(10);
    doc.text("PENALTY RECEIPT", 15, 24);
    doc.setFontSize(7);
    doc.text("Indian Railways — Official Document", 15, 30);

    // Receipt info
    doc.setTextColor(0);
    doc.setFontSize(9);
    doc.text(`Receipt ID: ${receiptId}`, 130, 18);
    doc.text(`Date: ${timestamp}`, 130, 24);

    // Details section
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("PENALTY DETAILS", 15, 48);
    doc.setFont(undefined, "normal");
    doc.setFontSize(9);

    const details = [
        ["Passenger", passenger.name],
        ["Coach / Seat", `${coach} - ${passenger.seatNo || "RAC"}`],
        ["Station", station],
        ["Train No", trainNo],
        ["TT Officer", `${ttName} (${ttId})`],
        ["Violation Type", passenger.penaltyType || "—"],
        ["Fine Amount", `₹${amount}`],
        ["Timestamp", timestamp],
    ];

    let y = 56;
    details.forEach(([label, val]) => {
        doc.setFont(undefined, "bold");
        doc.text(label + ":", 15, y);
        doc.setFont(undefined, "normal");
        doc.text(String(val), 70, y);
        y += 7;
    });

    // Divider
    doc.setDrawColor(200);
    doc.line(15, y + 2, 195, y + 2);

    // QR Code section
    const qrData = `SMARTRAIL|PENALTY|${receiptId}|${trainNo}|${coach}|${amount}|${timestamp}`;
    drawQRPlaceholder(doc, 150, y + 8, 40, qrData);

    doc.setFontSize(8);
    doc.text("Scan QR to verify receipt", 150, y + 54);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text("This is a computer-generated receipt. No signature required.", 15, 275);
    doc.text(`Issued by SmartRail TT System | ${receiptId}`, 15, 280);

    doc.save(`penalty_${receiptId}.pdf`);
    return receiptId;
};
