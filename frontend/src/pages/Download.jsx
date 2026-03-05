import React, { useState } from "react";
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
  const [chatMessages, setChatMessages] = useState([
    {
      from: "bot",
      text: "Hi! I'm your Barangay Bonbon assistant 👋\nAsk me anything about documents, requirements, fees, or the request process.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  const QUICK_CHATS = [
    "What documents are available?",
    "How do I request a document?",
    "Where do I pay?",
    "What ID do I need?",
    "How do I track my request?",
    "How long does it take?",
  ];

  const DOCS = [
    "Barangay Clearance",
    "Certificate of Residency",
    "Certificate of Indigency",
    "Certificate of First-Time Job Seeker",
    "Certificate of Common Law",
    "Certificate of Attestation",
    "Certificate of Oneness",
  ];

  const addMessage = (from, text) => {
    setChatMessages((prev) => [...prev, { from, text }]);
  };

  const getBotReply = (raw) => {
    const t = raw.toLowerCase();

    // ── Greetings ──────────────────────────────────────────────────────────
    if (
      /^(hi|hello|hey|good morning|good afternoon|kumusta|musta|oy|hoy)/.test(t)
    ) {
      return "Hello! 😊 How can I help you today? You can ask me about documents, fees, requirements, or the request process.";
    }

    // ── Available documents ────────────────────────────────────────────────
    if (
      t.includes("what document") ||
      t.includes("available document") ||
      t.includes("list of document") ||
      t.includes("anong dokumento") ||
      t.includes("types of") ||
      t.includes("kinds of") ||
      t.includes("what can i request")
    ) {
      return (
        "We currently offer these documents:\n\n" +
        DOCS.map((d) => `• ${d}`).join("\n") +
        "\n\nJust log in and go to 'New Request' to get started!"
      );
    }

    // ── Specific document: Barangay Clearance ──────────────────────────────
    if (t.includes("clearance")) {
      return (
        "📄 Barangay Clearance\n\n" +
        "Used for: employment, business, or general legal purposes.\n" +
        "Requirements: 1 valid government-issued ID.\n" +
        "Fee: ₱10 processing fee.\n" +
        "Processing time: 1–3 business days."
      );
    }

    // ── Specific document: Residency ───────────────────────────────────────
    if (t.includes("residency") || t.includes("certificate of resid")) {
      return (
        "📄 Certificate of Residency\n\n" +
        "Proves that you are a resident of Barangay Bonbon.\n" +
        "Requirements: 1 valid ID showing your Bonbon address.\n" +
        "Processing time: 1–3 business days."
      );
    }

    // ── Specific document: Indigency ───────────────────────────────────────
    if (t.includes("indigency") || t.includes("indigent")) {
      return (
        "📄 Certificate of Indigency\n\n" +
        "Used for: medical assistance, scholarships, or government benefits.\n" +
        "Requirements: 1 valid ID. No fee — this certificate is free.\n" +
        "Processing time: 1–3 business days."
      );
    }

    // ── Specific document: First-Time Job Seeker ──────────────────────────
    if (
      t.includes("job seeker") ||
      t.includes("first time job") ||
      t.includes("first-time job")
    ) {
      return (
        "📄 Certificate of First-Time Job Seeker\n\n" +
        "For fresh graduates or first-time job applicants. Exempts you from paying certain document fees.\n" +
        "Requirements: 1 valid ID + proof you are a first-time job seeker (e.g. school certificate).\n" +
        "Fee: Free under RA 11261."
      );
    }

    // ── Specific document: Common Law ─────────────────────────────────────
    if (t.includes("common law")) {
      return (
        "📄 Certificate of Common Law\n\n" +
        "Certifies that two individuals are living as common-law partners.\n" +
        "Requirements: Valid IDs of both partners + proof of cohabitation if available.\n" +
        "Processing time: 1–3 business days."
      );
    }

    // ── Specific document: Attestation ────────────────────────────────────
    if (t.includes("attestation")) {
      return (
        "📄 Certificate of Attestation\n\n" +
        "Used to attest or confirm certain facts about a resident (identity, residence, status).\n" +
        "Requirements: 1 valid government-issued ID.\n" +
        "Processing time: 1–3 business days."
      );
    }

    // ── Specific document: Oneness ────────────────────────────────────────
    if (
      t.includes("oneness") ||
      t.includes("one and the same") ||
      t.includes("same person")
    ) {
      return (
        "📄 Certificate of Oneness\n\n" +
        "Certifies that two different names (e.g. a typo on an ID) refer to the same person.\n" +
        "Requirements: 1 valid ID + the document showing the incorrect name.\n" +
        "Processing time: 1–3 business days."
      );
    }

    // ── Payment ────────────────────────────────────────────────────────────
    if (
      t.includes("pay") ||
      t.includes("payment") ||
      t.includes("bayad") ||
      t.includes("fee") ||
      t.includes("bayarin") ||
      t.includes("magkano")
    ) {
      return (
        "💳 Payment Information\n\n" +
        "Fees are paid at the Barangay Bonbon office cashier when you claim your document.\n\n" +
        "• All documents — ₱10 processing fee\n" +
        "• Certificate of Indigency & First-Time Job Seeker — FREE (under RA 11261)\n\n" +
        "Bring your reference number and a valid ID when you visit."
      );
    }

    // ── Process / How to request ───────────────────────────────────────────
    if (
      t.includes("process") ||
      t.includes("how do i request") ||
      t.includes("how to request") ||
      t.includes("steps") ||
      t.includes("paano") ||
      t.includes("how to apply") ||
      t.includes("mag-request")
    ) {
      return (
        "📋 How to Request a Document\n\n" +
        "1️⃣ Log in or register on the app/website.\n" +
        "2️⃣ Go to 'New Request' and pick the document you need.\n" +
        "3️⃣ Fill in the required form and submit.\n" +
        "4️⃣ Wait for the barangay to review — you'll get a status update.\n" +
        "5️⃣ Once approved or ready, visit the office to claim and pay.\n\n" +
        "You'll be notified by email whenever your status changes!"
      );
    }

    // ── Tracking / Status ──────────────────────────────────────────────────
    if (
      t.includes("status") ||
      t.includes("track") ||
      t.includes("where is my") ||
      t.includes("update") ||
      t.includes("pending") ||
      t.includes("approved")
    ) {
      return (
        "🔍 Tracking Your Request\n\n" +
        "You can check your request status anytime under 'My Requests' or 'History' in the app/website.\n\n" +
        "Status meanings:\n" +
        "• Pending — being reviewed by the barangay\n" +
        "• Approved — scheduled for pickup on your given date\n" +
        "• Ready for Pickup — visit the office now!\n" +
        "• Rejected — see the reason and resubmit if needed\n\n" +
        "You'll also receive an email for every status change."
      );
    }

    // ── Requirements / ID ─────────────────────────────────────────────────
    if (
      t.includes("requirement") ||
      t.includes("valid id") ||
      t.includes("need to bring") ||
      t.includes("what do i need") ||
      t.includes("ano ang kailangan") ||
      t.includes("bring")
    ) {
      return (
        "📎 General Requirements\n\n" +
        "For most documents, you need:\n" +
        "• 1 valid government-issued ID (e.g. PhilSys, Driver's License, Passport, UMID, Voter's ID)\n\n" +
        "Some documents have extra requirements:\n" +
        "• Common Law — IDs of both partners\n" +
        "• Oneness — the document with the incorrect name\n" +
        "• First-Time Job Seeker — proof of being a first-time applicant\n\n" +
        "Check the specific requirements when selecting a document in the app."
      );
    }

    // ── Processing time ────────────────────────────────────────────────────
    if (
      t.includes("how long") ||
      t.includes("ilang araw") ||
      t.includes("gaano katagal") ||
      t.includes("processing time") ||
      t.includes("when will") ||
      t.includes("kailan")
    ) {
      return (
        "⏱ Processing Time\n\n" +
        "Most documents are processed within 1–3 business days after submission.\n\n" +
        "Processing depends on barangay office hours (Mon–Fri, 8:00 AM – 5:00 PM). " +
        "You'll get an email notification as soon as your document is ready for pickup!"
      );
    }

    // ── Registration / Account ─────────────────────────────────────────────
    if (
      t.includes("register") ||
      t.includes("sign up") ||
      t.includes("create account") ||
      t.includes("account") ||
      t.includes("mag-register") ||
      t.includes("login") ||
      t.includes("log in")
    ) {
      return (
        "👤 Account & Registration\n\n" +
        "To use the system:\n" +
        "1️⃣ Register using your email and personal details.\n" +
        "2️⃣ Upload a valid government-issued ID for verification.\n" +
        "3️⃣ Wait for your account to be verified by your zone leader.\n" +
        "4️⃣ Once verified, you can log in and start requesting documents!\n\n" +
        "Verification typically takes 1–2 business days."
      );
    }

    // ── Office location / hours ────────────────────────────────────────────
    if (
      t.includes("office") ||
      t.includes("location") ||
      t.includes("address") ||
      t.includes("saan") ||
      t.includes("hours") ||
      t.includes("bukas") ||
      t.includes("open")
    ) {
      return (
        "🏢 Barangay Bonbon Office\n\n" +
        "📍 Barangay Bonbon, Cagayan de Oro City\n" +
        "🕗 Office Hours: Monday – Friday, 8:00 AM – 5:00 PM\n\n" +
        "Please bring your reference number and valid ID when claiming your document."
      );
    }

    // ── Thanks / goodbye ───────────────────────────────────────────────────
    if (/^(thank|thanks|salamat|okay|ok|sige|noted|got it)/.test(t)) {
      return "You're welcome! 😊 Feel free to ask if you have more questions. Have a great day!";
    }

    // ── Default fallback ───────────────────────────────────────────────────
    return (
      "I'm not sure about that, but here's what I can help with:\n\n" +
      "📄 Available documents\n" +
      "📋 How to request step-by-step\n" +
      "💳 Payment & fees\n" +
      "📎 Requirements & valid IDs\n" +
      "🔍 Tracking your request\n" +
      "⏱ Processing time\n" +
      "🏢 Office hours & location\n\n" +
      "Try one of the quick buttons below, or rephrase your question!"
    );
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    addMessage("user", userText);
    setChatInput("");
    setTimeout(() => addMessage("bot", getBotReply(userText)), 300);
  };

  const handleQuickChat = (text) => {
    addMessage("user", text);
    setTimeout(() => addMessage("bot", getBotReply(text)), 300);
  };

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
          className="w-full h-full blur-sm object-cover"
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
          <div className="relative flex flex-col gap-6 lg:items-end">
            {/* Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/30 rounded-full blur-[120px] animate-pulse"></div>

            {/* Phone Mockup */}
            <div className="relative self-center lg:self-auto">
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

      {/* Floating Chatbot Button + Panel (fixed on screen) */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
        {/* Chat Panel */}
        {isChatOpen && (
          <div className="w-96 max-w-[95vw] bg-gray-950 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-900/60 to-gray-900/60 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-emerald-900">
                  B
                </div>
                <div>
                  <p className="text-xs font-black text-white leading-none tracking-wide">
                    Bonbon Assistant
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-[10px] text-emerald-400">Online</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-all flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div
              className="h-72 overflow-y-auto space-y-2.5 p-4"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#065f46 transparent",
              }}
            >
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.from === "bot" && (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-black shrink-0 mt-1">
                      B
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] text-xs rounded-2xl px-3.5 py-2.5 whitespace-pre-line leading-relaxed ${
                      msg.from === "user"
                        ? "bg-emerald-600 text-white rounded-tr-sm"
                        : "bg-gray-800 text-gray-100 border border-gray-700 rounded-tl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Chats — 2-column grid, no scroll */}
            <div className="px-3 pb-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                Quick Questions
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_CHATS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleQuickChat(q)}
                    className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg text-left
                               bg-gray-800 border border-gray-700 text-gray-300
                               hover:bg-emerald-900/60 hover:border-emerald-500/50 hover:text-emerald-300
                               transition-all leading-tight"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-2 border-t border-white/5">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your question…"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-xs font-black text-white hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-900/50"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Circular Chat Toggle Button */}
        <button
          type="button"
          onClick={() => setIsChatOpen((prev) => !prev)}
          className="w-14 h-14 rounded-full bg-emerald-500 text-white shadow-xl flex items-center justify-center text-2xl font-bold border border-emerald-300 hover:bg-emerald-600 transition-all"
          aria-label="Open Barangay Bonbon chat assistant"
        >
          ?
        </button>
      </div>

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
