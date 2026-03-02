import React, { useState } from "react";
import { Lock, User, ShieldCheck, Eye, EyeOff, Download } from "lucide-react";
import logo from "../assets/logo.png";
import bonbonVideo from "../assets/bonbonVideo.mp4";
import { Link, useNavigate } from "react-router-dom";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useAuth } from "../context/AuthContext";
import PendingVerification from "../components/login/PendingVerification";
// MAKE SURE THIS COMPONENT EXISTS OR CREATE IT
import RejectedPage from "../components/login/RejectedPage";
const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rejectedUserId, setRejectedUserId] = useState(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  // Verification States
  const [isPending, setIsPending] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure hCaptcha is completed
    if (!captchaToken) {
      setError("Please complete the hCaptcha challenge.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Assuming login() returns the JSON response from the backend
      const result = await login(email, password, captchaToken);

      // Debug: Log the result
      console.log("=== LOGIN RESULT ===", result);

      if (result.success) {
        console.log("Login successful, redirecting...");
        const redirectPath =
          result.user?.role_id === 1 ? "/dashboard" : "/resident";
        navigate(redirectPath);
      }
      // Handle Pending
      else if (result.status === "pending_verification") {
        console.log("Account pending verification");
        setIsPending(true);
        setPendingEmail(result.email || email);
      }
      // Handle Rejected
      else if (result.status === "rejected") {
        setIsRejected(true);
        setRejectedUserId(result.user_id); // --- SET USER ID HERE ---
      }
      // Other errors (401, etc.)
      else {
        console.log("Login failed with error");
        setError(result.error || result.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Exception during login:", err);
      setError("An unexpected error occurred. Please try again.");
    }

    setLoading(false);
  };

  // --- CONDITIONAL RENDERING ---

  // 1. If account is pending, show the pending verification page
  if (isPending) {
    return <PendingVerification email={pendingEmail} />;
  }

  // 2. If account is rejected, show the rejected page
  if (isRejected) {
    // --- PASS USER ID HERE ---
    return <RejectedPage userId={rejectedUserId} />;
  }

  // 3. Otherwise, show the Login Form
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-50 to-gray-100 font-sans overflow-hidden">
      {/* LEFT SIDE: Branding & Video */}
      {/* LEFT SIDE: Video Branding */}
      <div className="relative hidden md:flex md:w-1/2 lg:w-3/5 overflow-hidden bg-zinc-950">
        {/* The Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-105 opacity-60"
        >
          <source src={bonbonVideo} type="video/mp4" />
        </video>

        {/* ── NEW GREEN GRADIENT OVERLAYS ── */}
        {/* Layer 1: Emerald Tint (Primary branding color) */}
        <div className="absolute inset-0 bg-emerald-950/40 mix-blend-multiply z-10" />

        {/* Layer 2: Directional Gradient (Fades to black at the bottom and left for text contrast) */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(6, 78, 59, 0.8) 0%, rgba(37, 68, 44, 0.4) 50%, rgba(29, 59, 47, 0.8) 100%)",
          }}
        />

        <div className="relative z-20 flex flex-col justify-between h-full p-16 lg:p-20">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="Logo"
              className="w-12 h-12 object-contain brightness-110"
            />
            <div className="h-8 w-px bg-white/20 ml-2" />
            <div>
              <h1 className="text-white text-xl font-bold tracking-tight">
                Barangay Bonbon
              </h1>
              <p className="text-emerald-400 text-[10px] uppercase font-bold tracking-[0.2em]">
                Document Request System
              </p>
            </div>
          </div>

          {/* Headline Section */}
          <div className="max-w-md">
            <h2 className="text-white text-5xl lg:text-6xl font-black leading-[1.1] mb-6 tracking-tight">
              Your documents, <br />
              <span className="text-emerald-400">Made Simple.</span>
            </h2>
            <p className="text-white/80 text-2xl leading-relaxed font-medium">
              Request and Track your Document Requests Digitally.
            </p>
          </div>

          {/* Download Section */}
          <div className="flex flex-col gap-4">
            <a
              href="/barangay-connect.apk"
              className="group flex items-center gap-4 text-white hover:text-emerald-400 transition-all duration-300"
            >
              <div className="p-3 bg-emerald-500/20 group-hover:bg-emerald-500 border border-emerald-500/30 rounded-full transition-all">
                <Download size={20} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-200/50">
                  Available for Android
                </p>
                <p className="text-sm font-bold">Download Official APK</p>
              </div>
            </a>
          </div>
        </div>
      </div>
      {/* RIGHT SIDE: Login Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 lg:p-20 bg-white/80 backdrop-blur-sm relative">
        <div className="w-full max-w-md relative z-10">
          <div className="mb-10 animate-fade-in">
            <h3 className="text-2xl text-emerald-600 mb-3 font-black tracking-tight uppercase">
              Sign In
            </h3>
            <p className="text-gray-600 text-base font-medium leading-relaxed">
              Please enter your credentials to continue.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2 animate-slide-up">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-widest ml-1">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600">
                  <User size={20} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-white"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2 animate-slide-up delay-100">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {/* Error Message Display */}
            {error && (
              <div className="   text-red-700 text-sm font-bold rounded-r-xl animate-shake">
                {error}
              </div>
            )}
            <div className="mt-4">
              <HCaptcha
                sitekey={
                  import.meta.env.VITE_HCAPTCHA_SITEKEY ||
                  "4ca09924-90e0-46a4-8f9a-a98cd0900a04"
                }
                onVerify={(token) => setCaptchaToken(token)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 mt-8 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "SIGN IN"
              )}
            </button>
          </form>

          <div className="flex mt-4 items-center justify-between animate-slide-up delay-200">
            <Link
              to="/register"
              className="text-md text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              <span className="text-gray-500">Don't have an account yet? </span>{" "}
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
