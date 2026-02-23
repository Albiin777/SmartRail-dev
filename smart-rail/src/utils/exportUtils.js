import jsPDF from "jspdf";

/** Export data as CSV file download */
export function exportToCSV(data, filename = "report") {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(","),
        ...data.map(row =>
            headers.map(h => {
                const val = String(row[h] ?? "").replace(/"/g, '""');
                return `"${val}"`;
            }).join(",")
        ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}

/** Export data as PDF table */
export function exportToPDF(data, filename = "report", title = "SmartRail Report") {
    if (!data || data.length === 0) return;

    const doc = new jsPDF({ orientation: "landscape" });
    const headers = Object.keys(data[0]);
    const pageW = doc.internal.pageSize.getWidth();
    const colW = (pageW - 30) / headers.length;

    // Title
    doc.setFontSize(16);
    doc.text(title, 15, 15);
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 15, 22);

    // Header row
    let y = 30;
    doc.setFontSize(7);
    doc.setFont(undefined, "bold");
    headers.forEach((h, i) => {
        doc.text(h.toUpperCase(), 15 + i * colW, y);
    });

    // Data rows
    doc.setFont(undefined, "normal");
    y += 6;
    data.forEach(row => {
        if (y > doc.internal.pageSize.getHeight() - 15) {
            doc.addPage();
            y = 15;
        }
        headers.forEach((h, i) => {
            const val = String(row[h] ?? "").substring(0, 30);
            doc.text(val, 15 + i * colW, y);
        });
        y += 5;
    });

    doc.save(`${filename}.pdf`);
}
