import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import Sidebar from "./Sidebar";

export default function Layout() {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) setCollapsed(false); // reset collapse on mobile
        };
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    const sidebarWidth = isMobile ? 0 : collapsed ? 72 : 250;

    return (
        <div className="flex min-h-screen" style={{ background: "var(--bg-body)" }}>
            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed(prev => !prev)}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />

            <main
                className="flex-1 min-h-screen overflow-y-auto transition-all duration-300"
                style={{ marginLeft: `${sidebarWidth}px` }}
            >
                {/* Mobile top bar */}
                {isMobile && (
                    <div className="mobile-topbar">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="mobile-menu-btn"
                        >
                            <FiMenu size={20} />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-base">🚆</span>
                            <span className="font-bold text-[15px]" style={{ color: "var(--text-primary)" }}>SmartRail</span>
                        </div>
                        <div style={{ width: 36 }} /> {/* spacer for centering */}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="layout-content"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
