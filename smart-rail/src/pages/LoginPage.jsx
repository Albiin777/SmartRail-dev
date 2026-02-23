import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { FiLock, FiMail, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                navigate("/");
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                navigate("/");
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (!email.toLowerCase().includes("tte")) {
                throw new Error("Access Denied: Only TTE accounts are authorized to log in here.");
            }

            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4 text-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-[#181818] rounded-2xl shadow-2xl border border-gray-800 p-8"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1e40af] bg-opacity-20 mb-4">
                        <span className="text-3xl">🚆</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">SmartRail</h1>
                    <p className="text-sm text-gray-400 mt-2">TT Enterprise Portal Login</p>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Official Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FiMail className="text-gray-500" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tte@smartrail.in"
                                className="w-full pl-11 pr-4 py-3 bg-[#222] border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-white placeholder-gray-600"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FiLock className="text-gray-500" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-11 pr-4 py-3 bg-[#222] border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-white placeholder-gray-600"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !email || !password}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? "Authenticating..." : (
                            <>
                                Sign In <FiArrowRight />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-500">
                    Secure Access for Authorized Personnel Only
                </div>
            </motion.div>
        </div>
    );
}
