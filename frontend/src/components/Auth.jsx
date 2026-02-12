import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Auth({ onClose }) {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [authMethod, setAuthMethod] = useState("email"); // 'email' | 'phone'

  // Form fields
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");

  // UI states
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleClose = () => {
    if (onClose) onClose();
  };

  // Email Signup
  const handleEmailSignup = async () => {
    try {
      setError("");
      setSuccess("");
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/signup-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setSuccess("Verification email sent! Please check your inbox.");
      setShowOtpInput(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Email Login
  const handleEmailLogin = async () => {
    try {
      setError("");
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // Show user-friendly error messages
        if (data.error?.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please try again.');
        } else if (data.error?.includes('Email not confirmed')) {
          throw new Error('Please verify your email first. Check your inbox for the OTP.');
        }
        throw new Error(data.error || 'Login failed');
      }

      // Store token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess("Login successful!");
      setTimeout(() => {
        handleClose();
        window.location.reload(); // Refresh to update auth state
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Phone Signup
  const handlePhoneSignup = async () => {
    try {
      setError("");
      setSuccess("");
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/signup-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}`, password, fullName })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setSuccess("OTP sent to your phone!");
      setShowOtpInput(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Phone Login (sends OTP)
  const handlePhoneLogin = async () => {
    try {
      setError("");
      setSuccess("");
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}` })
      });

      const data = await response.json();

      if (!response.ok) {
        // Show user-friendly error messages
        if (data.error?.includes('User not found') || data.error?.includes('not registered')) {
          throw new Error('This phone number is not registered. Please sign up first.');
        }
        throw new Error(data.error || 'Failed to send OTP');
      }

      setSuccess("OTP sent to your phone!");
      setShowOtpInput(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify Email OTP
  const handleVerifyEmailOTP = async () => {
    try {
      setError("");
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/verify-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: otp })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Store token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess("Email verified! Logging you in...");
      setTimeout(() => {
        handleClose();
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify Phone OTP
  const handleVerifyPhoneOTP = async () => {
    try {
      setError("");
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/verify-phone-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}`, token: otp })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Store token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess("Phone verified! Logging you in...");
      setTimeout(() => {
        handleClose();
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    try {
      setError("");
      setSuccess("");
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: authMethod,
          email: authMethod === 'email' ? email : undefined,
          phone: authMethod === 'phone' ? `+91${phone}` : undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setSuccess("OTP resent successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (showOtpInput) {
      // Verify OTP
      if (authMethod === 'email') {
        handleVerifyEmailOTP();
      } else {
        handleVerifyPhoneOTP();
      }
    } else {
      // Initial auth action
      if (mode === 'signup') {
        if (authMethod === 'email') {
          handleEmailSignup();
        } else {
          handlePhoneSignup();
        }
      } else {
        if (authMethod === 'email') {
          handleEmailLogin();
        } else {
          handlePhoneLogin();
        }
      }
    }
  };

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!loading) {
      handleSubmit();
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
        {mode === "signup" ? "Create account" : "Welcome back"}
      </h2>

      <p className="text-center text-gray-500 text-sm -mt-3 mb-2">
        {mode === "signup"
          ? "Start your journey with us today."
          : "Please enter your details to sign in."}
      </p>

      {/* GOOGLE BUTTON */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 border rounded-xl py-3 text-black hover:bg-gray-100 disabled:opacity-50"
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

      {/* AUTH FORM */}
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
        {/* AUTH METHOD TOGGLE */}
        {!showOtpInput && (
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setAuthMethod('email')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${authMethod === 'email' ? 'bg-[#2B2B2B] text-white' : 'text-gray-600'
                }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('phone')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${authMethod === 'phone' ? 'bg-[#2B2B2B] text-white' : 'text-gray-600'
                }`}
            >
              Phone
            </button>
          </div>
        )}

        {/* FORM INPUTS */}
        {!showOtpInput && (
          <>
            {mode === 'signup' && (
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-gray-200 rounded-xl px-4 py-3 text-black outline-none focus:ring-2 focus:ring-black"
              />
            )}

            {authMethod === 'email' ? (
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-200 rounded-xl px-4 py-3 text-black outline-none focus:ring-2 focus:ring-black"
              />
            ) : (
              <div className="flex gap-2">
                <div className="bg-gray-200 rounded-xl px-4 py-3 text-black font-medium">
                  +91
                </div>
                <input
                  type="tel"
                  placeholder="Phone (10 digits)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 bg-gray-200 rounded-xl px-4 py-3 text-black outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            )}

            {(mode === 'signup' || authMethod === 'email') && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-200 rounded-xl px-4 py-3 text-black outline-none focus:ring-2 focus:ring-black"
              />
            )}
          </>
        )}

        {/* OTP INPUT */}
        {showOtpInput && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full bg-gray-200 rounded-xl px-4 py-3 text-black text-center text-lg tracking-widest outline-none focus:ring-2 focus:ring-black"
              maxLength={6}
            />
            <button
              onClick={handleResendOTP}
              disabled={loading}
              className="w-full text-sm text-gray-600 hover:text-black disabled:opacity-50"
            >
              Resend OTP
            </button>
          </div>
        )}

        {/* ERROR/SUCCESS MESSAGES */}
        {error && (
          <p className="text-red-600 text-sm text-center bg-red-50 py-2 rounded-lg">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-600 text-sm text-center bg-green-50 py-2 rounded-lg">
            {success}
          </p>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading
            ? "Please wait..."
            : showOtpInput
              ? "Verify OTP"
              : mode === "signup"
                ? "Create Account"
                : authMethod === "phone"
                  ? "Send OTP"
                  : "Login"}
        </button>
      </form>

      {/* TOGGLE MODE */}
      {!showOtpInput && (
        <p className="text-center text-sm text-gray-600">
          {mode === "signup" ? "Already have an account?" : "New here?"}
          <button
            onClick={() => setMode(mode === "signup" ? "login" : "signup")}
            className="ml-2 font-bold text-black hover:underline"
          >
            {mode === "signup" ? "Login" : "Create account"}
          </button>
        </p>
      )}
    </div>
  );
}
