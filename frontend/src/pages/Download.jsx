import React from "react";
import {
  Smartphone,
  CheckCircle,
  Apple,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
import logo from "../assets/logo.png"; // Importing your logo

const DownloadApp = () => {
  const features = [
    "Real-time Request Tracking",
    "Digital Request Process",
    "Fast and Efficient",
    "Paperless Request Submission",
  ];

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
            <span className="text-sm font-black text-gray-900 leading-none tracking-tighter uppercase">
              Brgy Bonbon
            </span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">
              Document Request
            </span>
          </div>
        </div>
        <button className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-emerald-600 transition-colors"></button>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-12 lg:py-20 flex flex-col lg:flex-row items-center gap-16">
        {/* Left Side: Text Content */}
        <div className="lg:w-1/2">
          <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[0.95] mb-8 tracking-tighter">
            Government <br />
            <span className="text-emerald-500">at your </span> <br />
            fingertips.
          </h1>
          <span className="inline-block px-4 py-1.5 mb-6 text-[10px] font-black tracking-[0.2em] text-emerald-700 uppercase bg-emerald-50 rounded-lg border border-emerald-100">
            Now Available for Residents
          </span>
          <p className="text-base text-gray-500 mb-10 leading-relaxed max-w-md font-medium">
            Skip the long lines. Request clearances, permits, and certifications
            directly from your phone. Secure, fast, and officially recognized by
            Brgy. Bonbon.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-gray-700"
              >
                <div className="bg-emerald-50 p-1 rounded-full">
                  <CheckCircle className="text-emerald-500" size={18} />
                </div>
                <span className="text-sm font-semibold tracking-tight">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Download Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Google Play / APK Download Button */}
            <a
              href="/barangay-connect.apk" // Path to the file in your public folder
              download="Brgy_Bonbon_App.apk" // Optional: renames the file for the user
              className="flex items-center justify-center gap-3 bg-emerald-500 text-white px-8 py-4 rounded-2xl hover:bg-black transition-all transform hover:-translate-y-1 shadow-2xl shadow-emerald-900/20 cursor-pointer"
            >
              <PlayCircle size={24} />
              <div className="text-left">
                <p className="text-[9px] font-bold uppercase leading-none opacity-50 tracking-widest">
                  Download APK
                </p>
                <p className="text-base font-bold leading-none mt-1">
                  Direct Link
                </p>
              </div>
            </a>

            {/* App Store / PDF Guide Button */}
            <a
              href="/barangay.apk"
              download
              className="flex items-center justify-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-2xl hover:bg-emerald-50 transition-all transform hover:-translate-y-1 shadow-xl cursor-pointer"
            >
              <Apple size={24} />
              <div className="text-left">
                <p className="text-[9px] font-bold uppercase leading-none opacity-50 tracking-widest">
                  IOS
                </p>
                <p className="text-base font-bold leading-none mt-1">
                  App Store
                </p>
              </div>
            </a>
          </div>
        </div>

        {/* Right Side: Visual/Mockup */}
        <div className="lg:w-1/2 relative flex justify-center">
          {/* Abstract Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-50 rounded-full blur-[100px] opacity-50 -z-10"></div>

          <div className="relative bg-gray-900 rounded-[3.5rem] p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] rotate-2 hover:rotate-0 transition-transform duration-700">
            <div className="bg-white rounded-[3rem] overflow-hidden border-[6px] border-gray-900 aspect-[9/19] w-[280px] relative">
              {/* Fake App Interface */}
              <div className="absolute inset-0 bg-white flex flex-col">
                {/* Mockup Status Bar */}
                <div className="h-8 bg-white flex justify-between items-center px-8 pt-4">
                  <div className="w-12 h-2.5 bg-gray-100 rounded-full"></div>
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 bg-gray-100 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-gray-100 rounded-full"></div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-8 mt-4">
                    <img src={logo} alt="Logo" className="w-8 h-8 opacity-80" />
                    <div className="h-3 w-20 bg-gray-100 rounded-full"></div>
                  </div>

                  <div className="h-6 w-3/4 bg-emerald-500/10 rounded-lg mb-2"></div>
                  <div className="h-4 w-1/2 bg-gray-50 rounded-lg mb-10"></div>

                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3 border border-gray-100"
                      >
                        <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-500">
                          <Smartphone size={16} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="h-2 w-full bg-gray-200/50 rounded-full"></div>
                          <div className="h-2 w-1/3 bg-gray-200/50 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Verification Badge */}
          <div className="absolute -bottom-4 -left-4 bg-white p-5 rounded-2xl shadow-2xl flex items-center gap-4 border border-emerald-50">
            <div className="bg-emerald-500 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-200">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">
                BY FAB-IT2-02
              </p>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">
                Project System
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="bg-gray-50 py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <img
            src={logo}
            alt="Logo"
            className="w-8 h-8 mx-auto mb-4 grayscale opacity-30"
          />
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">
            © 2026 Barangay Bonbon Government Units
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DownloadApp;
