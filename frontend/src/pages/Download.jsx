import React from "react";
import {
  Smartphone,
  CheckCircle,
  Apple,
  PlayCircle,
  ShieldCheck,
  Download,
  Zap,
  Lock,
  Clock,
} from "lucide-react";
import logo from "../assets/logo.png";
import bonbonVideo from "../assets/bonbonVideo.mp4";

const DownloadApp = () => {
  const features = [
    {
      icon: <Zap size={18} />,
      title: "Real-time Tracking",
      desc: "Monitor your requests instantly",
    },
    {
      icon: <Lock size={18} />,
      title: "Secure Process",
      desc: "Government-verified system",
    },
    {
      icon: <Clock size={18} />,
      title: "Fast & Efficient",
      desc: "Save time, skip the lines",
    },
    {
      icon: <CheckCircle size={18} />,
      title: "Paperless",
      desc: "100% digital submission",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Background with Green Overlay */}
      <div className="fixed inset-0 -z-10">
        <video
          src={bonbonVideo}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label="Promotional video background for Brgy Bonbon app"
        />
        {/* Gradient Overlay - Dark Green to Black */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/95 via-emerald-800/90 to-gray-900/95"></div>
        {/* Additional Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDE2djI4aDI4VjE2SDM2em0xOCAyNmgtMTZ2LTE2aDE2djE2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 md:px-8 py-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center ">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 0">
              <img
                src={logo}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black text-white leading-none tracking-tight">
                BRGY BONBON
              </span>
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mt-1">
                Document Request System
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="px-4 py-2 bg-emerald-500/20 backdrop-blur-sm rounded-lg border border-emerald-400/30">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                Official System
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side: Text Content */}
          <div className="space-y-8">
            {/* Main Heading */}
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] mb-4">
                Government
                <br />
                <span className="text-emerald-400">Services</span>
                <br />
                Made Simple.
              </h1>
              <div className="h-1.5 w-24 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full mt-6"></div>
            </div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-white uppercase tracking-widest">
                Now Available
              </span>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-300 leading-relaxed max-w-xl">
              Skip the long lines. Request clearances, permits, and
              certifications directly from your phone.{" "}
              <span className="text-white font-semibold">
                Secure, fast, and officially recognized
              </span>{" "}
              by Barangay Bonbon.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all group"
                >
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-0.5">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {/* APK Download */}
              <a
                href="/barangay-connect.apk"
                download="Brgy_Bonbon_App.apk"
                className="group flex items-center justify-center gap-4 bg-emerald-500 text-white px-8 py-5 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/50 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <Download size={24} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase leading-none  tracking-widest">
                    Download for Android
                  </p>
                  <p className="text-lg font-black leading-none mt-1.5">
                    APK File
                  </p>
                </div>
              </a>

              {/* iOS Button */}
              <a
                href="/barangay.apk"
                download
                className="group flex items-center justify-center gap-4 bg-white/10 backdrop-blur-md text-white px-8 py-5 rounded-2xl hover:bg-white/20 transition-all transform hover:scale-105 border border-white/20 cursor-pointer"
              >
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all">
                  <Apple size={24} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase leading-none opacity-70 tracking-widest">
                    Coming Soon
                  </p>
                  <p className="text-lg font-black leading-none mt-1.5">
                    App Store
                  </p>
                </div>
              </a>
            </div>

            {/* Trust Badge */}
            <div className="flex items-center gap-3 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full border-2 border-emerald-900 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-white">1,284+ Residents</p>
                <p className="text-xs text-gray-400">Already using the app</p>
              </div>
            </div>
          </div>

          {/* Right Side: Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/30 rounded-full blur-[120px] animate-pulse"></div>

            {/* Phone Mockup */}
            <div className="relative">
              <div className="relative bg-gray-900 rounded-[3.5rem] p-3 shadow-2xl transform hover:rotate-2 transition-all duration-500 border border-white/10">
                <div className="bg-white rounded-[3rem] overflow-hidden border-[6px] border-gray-900 aspect-[9/19] w-[300px] relative shadow-inner">
                  {/* Mockup Content */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
                    {/* Status Bar */}
                    <div className="h-10 bg-white flex justify-between items-center px-8 pt-4 border-b border-gray-100">
                      <div className="text-[10px] font-bold text-gray-900">
                        9:41
                      </div>
                      <div className="flex gap-1 items-center">
                        <div className="w-4 h-3 border border-gray-900 rounded-sm relative">
                          <div className="absolute inset-0.5 bg-gray-900 rounded-[1px]"></div>
                        </div>
                      </div>
                    </div>

                    {/* App Header */}
                    <div className="p-6 ">
                      <div className="flex items-center gap-2 mb-6">
                        <img
                          src={logo}
                          alt="Logo"
                          className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg p-1"
                        />
                        <div>
                          <p className="text-sm font-black text-emerald-500">
                            BRGY BONBON
                          </p>
                          <p className="text-[0.8rem] text-gray-500">
                            Document Portal
                          </p>
                        </div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                        <p className="text-xs font-bold text-white mb-1">
                          Welcome Back!
                        </p>
                        <p className="text-[10px] text-white/80">
                          Track your requests
                        </p>
                      </div>
                    </div>

                    {/* Request Cards */}
                    <div className="p-4 space-y-3 flex-1 overflow-hidden">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="p-4 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center gap-3"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-md">
                            <Smartphone size={18} />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="h-2 w-full bg-gray-200 rounded-full"></div>
                            <div className="h-2 w-2/3 bg-gray-100 rounded-full"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-30 bg-white/10 backdrop-blur-xl p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-xs  text-white uppercase">Verified</p>
                  <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide">
                    Official App
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { number: "1,284", label: "Active Users" },
            { number: "5,432", label: "Requests Processed" },
            { number: "98%", label: "Satisfaction Rate" },
            { number: "24/7", label: "Available" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            >
              <p className="text-3xl md:text-4xl font-black text-white mb-2">
                {stat.number}
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Logo"
                className="w-8 h-8 opacity-50 grayscale"
              />
              <p className="text-xs text-gray-400 font-semibold">
                © 2026 Barangay Bonbon. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Developed by</span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                FAB-IT2-02
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DownloadApp;
