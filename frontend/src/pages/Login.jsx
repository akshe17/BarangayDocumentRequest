import React, { useState } from "react";
import { Lock, User, ShieldCheck, Eye, EyeOff, Download } from "lucide-react";
import logo from "../assets/logo.png";
import bonbonVideo from "../assets/bonbonVideo.mp4";

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin();
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-50 to-gray-100 font-sans overflow-hidden">
      {/* LEFT SIDE */}
      <div className="relative hidden md:flex md:w-1/2 lg:w-3/5 overflow-hidden bg-black">
        {/* Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={bonbonVideo} type="video/mp4" />
        </video>

        {/* Overlay (cleaner, flatter) */}
        <div className="absolute inset-0 bg-emerald-900/90" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />

        {/* CONTENT */}
        <div className="relative z-10 flex flex-col justify-between h-full p-16">
          {/* TOP BRAND */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl  backdrop-blur-md flex items-center justify-center">
              <img
                src={logo}
                alt="Barangay Bonbon Logo"
                className="w-10 h-10 object-contain"
              />
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

          {/* CENTER MESSAGE */}
          <div className="max-w-xl">
            <h2 className="text-white text-4xl font-black leading-tight mb-6">
              Your Documents Made{" "}
              <span className="text-emerald-400">Easier.</span>
            </h2>

            <p className="text-gray-200 text-lg leading-relaxed">
              A centralized digital platform designed to simplify document
              requests, verification, and approvals for residents and staff.
            </p>

            {/* Feature bullets */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-gray-100">
                <ShieldCheck size={20} className="text-emerald-400" />
                Secure identity verification
              </div>
              <div className="flex items-center gap-3 text-gray-100">
                <User size={20} className="text-emerald-400" />
                Resident-friendly interface
              </div>
              <div className="flex items-center gap-3 text-gray-100">
                <Lock size={20} className="text-emerald-400" />
                Role-based admin access
              </div>
            </div>
          </div>

          {/* BOTTOM INFO */}
          <div className="flex items-center justify-between text-sm text-gray-300">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 shadow-lg">
                <p className="text-white text-xs font-bold mb-1">
                  Download App
                </p>
                <p className="text-gray-200 text-xs mb-2">
                  Get the mobile app for document requests.
                </p>
                <a
                  href="/barangay-connect.apk"
                  download="Brgy_Bonbon_App.apk"
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded transition-all text-xs font-bold shadow-md"
                >
                  <Download size={12} />
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Simplified Login Form (Unchanged) */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 lg:p-20 bg-white/80 backdrop-blur-sm relative">
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2djI4aDI4VjE2SDM2em0xOCAyNmgtMTZ2LTE2aDE2djE2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col items-center mb-12 animate-bounce-in">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-4 shadow-lg animate-pulse">
              <img
                src={logo}
                alt="Barangay Bonbon Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <h2 className="text-xl font-black text-gray-900 leading-tight tracking-tight">
              Barangay Bonbon
            </h2>
            <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mt-2">
              Document System
            </p>
          </div>

          {/* Header */}
          <div className="mb-10 animate-fade-in">
            <h3 className="text-2xl text-emerald-600 mb-3 font-black tracking-tight">
              SIGN IN
            </h3>
            <p className="text-gray-600 text-base font-medium leading-relaxed">
              Please enter your admin credentials to continue.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="space-y-2 animate-slide-up">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-widest ml-1">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors duration-300">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300 bg-white shadow-sm hover:shadow-md focus:shadow-lg"
                  placeholder="Enter your username"
                  aria-label="Username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 animate-slide-up delay-100">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors duration-300">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-12 pr-12 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300 bg-white shadow-sm hover:shadow-md focus:shadow-lg"
                  placeholder="Enter your password"
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between animate-slide-up delay-200">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
                />
                Remember Me
              </label>
              <a
                href="#"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 mt-8 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Sign In"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "SIGN IN"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
