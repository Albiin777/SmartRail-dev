import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider, appleProvider } from "../firebase";

export default function Auth({ onClose }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");

  const isEmail = identifier.includes("@");

  const handleAuth = async () => {
    try {
      setError("");

      if (!isEmail) {
        setError("Phone login via OTP coming soon 🚧");
        return;
      }

      if (isSignup) {
        await createUserWithEmailAndPassword(auth, identifier, password);
      } else {
        await signInWithEmailAndPassword(auth, identifier, password);
      }

      onClose(); // ✅ close after successful login
    } catch (err) {
      setError(err.message);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError("");
      await signInWithPopup(auth, googleProvider);
      onClose(); // ✅ close after success
    } catch (err) {
      setError(err.message);
    }
  };

  const loginWithApple = async () => {
    try {
      setError("");
      await signInWithPopup(auth, appleProvider);
      onClose(); // ✅ close after success
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;
    await signOut(auth);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
      onClick={onClose} // click outside closes
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl px-8 py-10"
        onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-black transition"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {isSignup ? "Create your account" : "Welcome back"}
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            {isSignup
              ? "Sign up to continue with SmartRail"
              : "Login to continue your journey"}
          </p>
        </div>

        {/* Social Buttons */}
        <div className="space-y-3">
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 border rounded-xl py-3 font-medium text-gray-800 hover:bg-gray-50 transition"
          >
            Continue with Google
          </button>

          <button
            onClick={loginWithApple}
            className="w-full flex items-center justify-center gap-3 border rounded-xl py-3 font-medium text-gray-800 hover:bg-gray-50 transition"
          >
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Email or phone number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm text-gray-900"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm text-gray-900"
          />
        </div>

        {error && (
          <p className="text-red-600 text-xs mt-3 text-center">{error}</p>
        )}

        <button
          onClick={handleAuth}
          className="w-full mt-6 bg-gradient-to-r from-black to-gray-800 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
        >
          {isSignup ? "Create Account" : "Login"}
        </button>

        <p className="text-sm text-center text-gray-500 mt-5">
          {isSignup ? "Already have an account?" : "New to SmartRail?"}{" "}
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-black font-semibold hover:underline"
          >
            {isSignup ? "Login" : "Create account"}
          </button>
        </p>

        <button
          onClick={handleLogout}
          className="block mx-auto mt-4 text-xs text-red-500 hover:underline"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
