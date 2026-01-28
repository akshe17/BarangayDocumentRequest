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
    <div className="min-h-screen flex font-poppins flex-col md:flex-row bg-white font-sans overflow-hidden">
      {/* LEFT SIDE: Emphasized Video with Minimal Branding */}
      <div className="relative hidden md:flex md:w-1/2 lg:w-3/5 overflow-hidden bg-black">
        {/* The Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute z-0 w-full h-full object-cover"
        >
          <source src={bonbonVideo} type="video/mp4" />
        </video>

        <div className="absolute inset-0 z-10 bg-emerald-700/50 mix-blend-multiply"></div>

        <div className="absolute inset-0 z-20 bg-gradient-to-t from-emerald-900/80 via-transparent to-emerald-900/40"></div>

        <div className="absolute top-10 left-10 z-30">
          <div className="flex items-center gap-4  p-3 pr-6 rounded-2xl ">
            <div className="p-2 rounded-xl ">
              <img src={logo} alt="Logo" className="w-20 h-20 object-contain" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-white text-2xl font-bold">BARANGAY BONBON</h1>
              <p className="text-gray-300 text-[10px] font-bold uppercase tracking-widest mt-1">
                Document Request System
              </p>
            </div>
          </div>
        </div>
        {/* BOTTOM LEFT SECURED INDICATOR */}
        <div className="absolute bottom-10 left-10 z-30 flex items-center gap-2 opacity-50">
          <ShieldCheck size={14} className="text-white" />
          <span className="text-[9px] text-white font-bold uppercase tracking-[0.2em]">
            FAB-IT2-02
          </span>
        </div>
      </div>

      {/* RIGHT SIDE: Login Inputs */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 lg:p-20 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile Logo Only */}
          <div className="md:hidden flex flex-col items-center mb-10">
            <img src={logo} alt="Logo" className="w-20 h-20 mb-4" />
            <h2 className="text-2xl font-black text-gray-900 leading-none">
              Barangay Bonbon
            </h2>
            <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest mt-2">
              Document System
            </p>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl text-emerald-500 mb-2 tracking-tight">
              Your Documents Made Easier.
            </h3>
            <p className="text-gray-600 text-sm font-medium">
              Please enter your admin credentials.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] font-boldtext-gray-500 uppercase tracking-widest ml-1">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-emerald-600 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="block text-[0.8rem] w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all bg-gray-50/50"
                  placeholder="email@gmail.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-boldtext-gray-500 uppercase tracking-widest ml-1">
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-emerald-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all bg-gray-50/50 font-semibold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 cursor-pointer text-white  py-2 rounded-2xl transition-all  shadow-emerald-100 flex items-center justify-center  gap-3 mt-8 active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                "SIGN IN"
              )}
            </button>
          </form>

          <p className="mt-12 text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            © 2026 Barangay Bonbon
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
