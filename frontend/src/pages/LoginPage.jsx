import React, { useState } from "react";
import { Lock, User, ShieldCheck, Eye, EyeOff, Download } from "lucide-react";
import logo from "../assets/logo.png";
import bonbonVideo from "../assets/bonbonVideo.mp4";
import { Link, useNavigate } from "react-router-dom"; // Fixed: Added useNavigate
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form States
  const [email, setEmail] = useState(""); // Linked to "Username" field
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // LoginPage.jsx — only the part that changed (inside handleSubmit)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(email, password);

    if (result.success) {
      // FIX: navigate based on role instead of hardcoding /dashboard
      const redirectPath =
        result.user?.role_id === 1 ? "/dashboard" : "/resident";
      navigate(redirectPath);
    } else {
      setError(result.error || "Invalid credentials");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-50 to-gray-100 font-sans overflow-hidden">
      {/* LEFT SIDE: Branding & Video */}
      <div className="relative hidden md:flex md:w-1/2 lg:w-3/5 overflow-hidden bg-black">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={bonbonVideo} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-[2px] z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/90 z-10" />

        <div className="relative z-10 flex flex-col justify-between h-full p-16">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl backdrop-blur-md flex items-center justify-center">
              <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-white text-2xl font-black tracking-tight">
                Barangay Bonbon
              </h1>
              <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mt-1">
                Document Request System
              </p>
            </div>
          </div>

          <div className="max-w-xl">
            <h2 className="text-white text-4xl font-black leading-tight mb-6">
              Your Documents Made{" "}
              <span className="text-emerald-400">Easier.</span>
            </h2>
            <p className="text-gray-200 text-lg leading-relaxed">
              A centralized digital platform designed to simplify document
              requests, verification, and approvals.
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="inline-flex items-center gap-6 bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
              <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                <Download size={24} className="text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">
                  Download Mobile App
                </p>
                <p className="text-emerald-100/50 text-xs">
                  Request via Android APK
                </p>
              </div>
              <a
                href="/barangay-connect.apk"
                className="ml-4 bg-white hover:bg-emerald-50 text-emerald-950 px-6 py-2.5 rounded-xl transition-all text-xs font-black shadow-xl"
              >
                INSTALL
              </a>
            </div>
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

          {/* Error Message Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl animate-shake">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2 animate-slide-up">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-widest ml-1">
                Email / Username
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
