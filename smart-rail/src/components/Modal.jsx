import { motion, AnimatePresence } from "framer-motion";

export default function Modal({ open, onClose, children }) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl w-80"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.9 }}
                    >
                        {children}
                        <button
                            onClick={onClose}
                            className="mt-4 text-sm text-gray-300"
                        >
                            Close
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
