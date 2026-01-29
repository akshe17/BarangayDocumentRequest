import React, { useState } from "react";
import { Lock, User, ShieldCheck } from "lucide-react";
import logo from "../assets/logo.png";
import bonbonVideo from "../assets/bonbonVideo.mp4";

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin();
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans overflow-hidden">
      {/* LEFT SIDE: Video Background with Branding */}
      <div className="relative hidden md:flex md:w-1/2 lg:w-3/5 overflow-hidden bg-black">
        {/* Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute z-0 w-full h-full object-cover"
          aria-label="Promotional video for Barangay Bonbon"
        >
          <source src={bonbonVideo} type="video/mp4" />
        </video>

        {/* Overlays for Depth */}
        <div className="absolute inset-0 z-10 bg-emerald-700/50 mix-blend-multiply"></div>
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-emerald-900/80 via-transparent to-emerald-900/40"></div>

        {/* Top Branding */}
        <div className="absolute top-10 left-10 z-30">
          <div className="flex items-center gap-4 p-3 pr-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
            <div className="p-2 rounded-xl bg-white/20">
              <img
                src={logo}
                alt="Barangay Bonbon Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-white text-xl font-black tracking-tight">
                BARANGAY BONBON
              </h1>
              <p className="text-emerald-200 text-xs font-semibold uppercase tracking-widest mt-1">
                Document Request System
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Secured Indicator */}
        <div className="absolute bottom-10 left-10 z-30 flex items-center gap-2 opacity-70">
          <ShieldCheck size={16} className="text-white" />
          <span className="text-xs text-white font-bold uppercase tracking-widest">
            FAB-IT2-02
          </span>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 lg:p-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col items-center mb-12">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <img
                src={logo}
                alt="Barangay Bonbon Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight tracking-tight">
              Barangay Bonbon
            </h2>
            <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mt-2">
              Document System
            </p>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h3 className="text-3xl text-emerald-600 mb-3 font-black tracking-tight">
              Your Documents Made Easier.
            </h3>
            <p className="text-gray-600 text-base font-medium leading-relaxed">
              Please enter your admin credentials to continue.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors duration-200">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  placeholder="Enter your username"
                  aria-label="Username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors duration-200">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  placeholder="Enter your password"
                  aria-label="Password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 mt-8 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Sign In"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "SIGN IN"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-12 text-center text-xs text-gray-500 font-semibold uppercase tracking-widest">
            © 2026 Barangay Bonbon
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
