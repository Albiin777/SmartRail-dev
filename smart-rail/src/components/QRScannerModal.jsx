import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCamera } from "react-icons/fi";

export default function QRScannerModal({ isOpen, onClose, onScan }) {
    const scannerRef = useRef(null);
    const html5QrcodeRef = useRef(null);
    const [error, setError] = useState(null);
    const [manualInput, setManualInput] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        let scanner = null;

        const startScanner = async () => {
            try {
                const { Html5Qrcode } = await import("html5-qrcode");
                scanner = new Html5Qrcode("qr-reader");
                html5QrcodeRef.current = scanner;

                await scanner.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        onScan(decodedText);
                        stopScanner();
                        onClose();
                    },
                    () => { } // ignore scan failures
                );
            } catch (err) {
                setError("Camera not available. Use manual input below.");
            }
        };

        const stopScanner = async () => {
            if (html5QrcodeRef.current) {
                try {
                    await html5QrcodeRef.current.stop();
                    html5QrcodeRef.current.clear();
                } catch { }
            }
        };

        // Small delay to let DOM render
        const timeout = setTimeout(startScanner, 300);

        return () => {
            clearTimeout(timeout);
            stopScanner();
        };
    }, [isOpen]);

    const handleManualSubmit = () => {
        if (manualInput.trim()) {
            onScan(manualInput.trim());
            setManualInput("");
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center z-50"
                style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="card-static p-6 w-[420px] max-w-[90vw]"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                            <FiCamera size={16} style={{ color: "var(--accent-blue)" }} />
                            Scan Ticket QR
                        </h3>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                            <FiX size={16} style={{ color: "var(--text-muted)" }} />
                        </button>
                    </div>

                    {/* QR Reader Container */}
                    <div
                        id="qr-reader"
                        ref={scannerRef}
                        className="rounded-xl overflow-hidden mb-4"
                        style={{ width: "100%", minHeight: "250px", background: "var(--bg-input)" }}
                    />

                    {error && (
                        <p className="text-[12px] mb-3 p-2 rounded-lg" style={{ background: "var(--accent-amber-bg)", color: "var(--accent-amber)" }}>
                            {error}
                        </p>
                    )}

                    {/* Manual Input Fallback */}
                    <div>
                        <label className="text-[11px] uppercase tracking-wider font-semibold block mb-1.5" style={{ color: "var(--text-muted)" }}>
                            Or Enter Passenger ID / QR Code Manually
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={manualInput}
                                onChange={e => setManualInput(e.target.value)}
                                placeholder="e.g., 1 or SMARTRAIL|1|Rahul|S3|1"
                                className="input-field flex-1"
                                onKeyDown={e => e.key === "Enter" && handleManualSubmit()}
                            />
                            <button onClick={handleManualSubmit} className="btn btn-dark">
                                Lookup
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
