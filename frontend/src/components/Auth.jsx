import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebase";

export default function Auth({ onClose }) {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEmail = identifier.includes("@");
  const isPhone = /^[0-9]{10}$/.test(identifier);

  // ✅ Close button uses the passed prop
  const handleClose = () => {
    if (onClose) onClose();
    else navigate("/");
  };

  const handleAuth = async () => {
    try {
      setError("");
      setLoading(true);

      // 🔥 PHONE OTP
      if (isPhone) {
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
              size: "invisible",
            }
          );
        }

        const appVerifier = window.recaptchaVerifier;

        const result = await signInWithPhoneNumber(
          auth,
          "+91" + identifier,
          appVerifier
        );

        setConfirmationResult(result);
        setLoading(false);
        return;
      }

      // 🔥 EMAIL SIGNUP
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          identifier,
          password
        );

        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: identifier,
          provider: "email",
          createdAt: new Date(),
        });
      } else {
        await signInWithEmailAndPassword(auth, identifier, password);
      }

      setLoading(false);
      setLoading(false);
      if (onClose) onClose();
      else navigate("/");
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);

      const result = await confirmationResult.confirm(otp);

      await setDoc(
        doc(db, "users", result.user.uid),
        {
          phone: result.user.phoneNumber,
          provider: "phone",
          createdAt: new Date(),
        },
        { merge: true }
      );

      setLoading(false);
      setLoading(false);
      if (onClose) onClose();
      else navigate("/");
    } catch (err) {
      setLoading(false);
      setError("Invalid OTP");
    }
  };

  const socialLogin = async () => {
    try {
      setError("");
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);

      await setDoc(
        doc(db, "users", result.user.uid),
        {
          email: result.user.email,
          provider: "google",
          createdAt: new Date(),
        },
        { merge: true }
      );

      setLoading(false);
      setLoading(false);
      if (onClose) onClose();
      else navigate("/");
    } catch (err) {
      setLoading(false);

      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message);
      }
    }
  };

  return (
    <div className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-xl flex flex-col gap-5">

      {/* CLOSE BUTTON */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-5 text-gray-600 hover:text-black text-xl"
      >
        ✕
      </button>

      <h2 className="text-2xl font-bold text-center text-black">
        {isSignup ? "Create account" : "Welcome back"}
      </h2>

      {/* GOOGLE BUTTON */}
      <button
        onClick={socialLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 border rounded-xl py-3 text-black hover:bg-gray-100"
      >
        <svg className="w-5 h-5" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.69 1.22 9.19 3.61l6.86-6.86C35.64 2.39 30.21 0 24 0 14.82 0 6.73 5.64 2.69 13.76l7.99 6.2C12.47 13.43 17.73 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.5 24.5c0-1.64-.15-3.21-.43-4.73H24v9.01h12.69c-.55 2.98-2.21 5.51-4.71 7.21l7.3 5.68C43.98 37.38 46.5 31.47 46.5 24.5z" />
          <path fill="#FBBC05" d="M10.68 28.96A14.5 14.5 0 019.5 24c0-1.72.3-3.39.84-4.96l-7.99-6.2A23.96 23.96 0 000 24c0 3.84.92 7.47 2.69 10.76l7.99-6.2z" />
          <path fill="#34A853" d="M24 48c6.21 0 11.64-2.05 15.52-5.58l-7.3-5.68c-2.03 1.36-4.64 2.16-8.22 2.16-6.27 0-11.53-3.93-13.32-9.46l-7.99 6.2C6.73 42.36 14.82 48 24 48z" />
        </svg>
        Continue with Google
      </button>

      <div className="text-center text-sm text-gray-500">OR</div>

      <input
        type="text"
        placeholder="Email or Phone (10 digits)"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        className="w-full bg-gray-200 rounded-xl px-4 py-3 text-black"
      />

      {!isPhone && (
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-gray-200 rounded-xl px-4 py-3 text-black"
        />
      )}

      {confirmationResult && (
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full bg-gray-200 rounded-xl px-4 py-3 text-black"
        />
      )}

      {error && (
        <p className="text-red-600 text-sm text-center">{error}</p>
      )}

      {!confirmationResult ? (
        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl"
        >
          {loading
            ? "Please wait..."
            : isPhone
              ? "Send OTP"
              : isSignup
                ? "Create Account"
                : "Login"}
        </button>
      ) : (
        <button
          onClick={verifyOtp}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      )}

      <p className="text-center text-sm text-gray-600">
        {isSignup ? "Already have an account?" : "New here?"}
        <button
          onClick={() => setIsSignup(!isSignup)}
          className="ml-2 font-bold text-black"
        >
          {isSignup ? "Login" : "Create account"}
        </button>
      </p>

      <div id="recaptcha-container"></div>
    </div>
  );
}
