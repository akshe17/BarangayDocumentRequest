import React, { useState } from "react";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Download,
  FileText,
  CheckCircle,
  Clock,
  Shield,
  FileBadge,
  Stamp,
} from "lucide-react";
import logo from "../assets/logo.png";
import bonbonVideo from "../assets/bonbonVideo.mp4";
import { Link, useNavigate } from "react-router-dom";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useAuth } from "../context/AuthContext";
import PendingVerification from "../components/login/PendingVerification";
import RejectedPage from "../components/login/RejectedPage";
import Footer from "../components/Footer";
const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rejectedUserId, setRejectedUserId] = useState(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    console.log(email, password);
    setError("");
    try {
      const result = await login(email, password, captchaToken);
      if (result.success) {
        navigate(result.user?.role_id === 1 ? "/dashboard" : "/resident");
      } else if (result.status === "pending_verification") {
        setIsPending(true);
        setPendingEmail(result.email || email);
      } else if (result.status === "rejected") {
        setIsRejected(true);
        setRejectedUserId(result.user_id);
      } else {
        setError(result.error || result.message || "Invalid credentials");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    }
    setLoading(false);
  };

  if (isPending) return <PendingVerification email={pendingEmail} />;
  if (isRejected) return <RejectedPage userId={rejectedUserId} />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

        .login-root  { font-family: 'DM Sans', sans-serif; }
        .df          { font-family: 'Bricolage Grotesque', sans-serif; }

        /* ── card floats ── */
        @keyframes floatA {
          0%,100% { transform: translateY(0px)   rotate(-6deg); }
          50%     { transform: translateY(-14px)  rotate(-6deg); }
        }
        @keyframes floatB {
          0%,100% { transform: translateY(0px)   rotate(4deg); }
          50%     { transform: translateY(-10px)  rotate(4deg); }
        }
        @keyframes floatC {
          0%,100% { transform: translateY(0px)   rotate(-2deg); }
          50%     { transform: translateY(-18px)  rotate(-2deg); }
        }
        @keyframes floatD {
          0%,100% { transform: translateY(0px)   rotate(8deg); }
          50%     { transform: translateY(-8px)   rotate(8deg); }
        }
        @keyframes floatE {
          0%,100% { transform: translateY(0px)   rotate(-12deg); }
          50%     { transform: translateY(-12px)  rotate(-12deg); }
        }

        /* ── decorative ── */
        @keyframes spinSlow  { to { transform: rotate(360deg); } }
        @keyframes pulseDot  {
          0%,100% { opacity:.3; transform:scale(1); }
          50%     { opacity:.7; transform:scale(1.4); }
        }

        /* ── right-panel entrance ── */
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .fa { animation: floatA 6s   ease-in-out infinite; }
        .fb { animation: floatB 7s   ease-in-out infinite  0.5s; }
        .fc { animation: floatC 8s   ease-in-out infinite  1.0s; }
        .fd { animation: floatD 5.5s ease-in-out infinite  1.5s; }
        .fe { animation: floatE 9s   ease-in-out infinite  2.0s; }

        .spin-slow   { animation: spinSlow  20s linear     infinite; }
        .pdot        { animation: pulseDot   3s ease-in-out infinite; }

        .f1 { animation: fadeUp .5s ease both .05s; }
        .f2 { animation: fadeUp .5s ease both .15s; }
        .f3 { animation: fadeUp .5s ease both .25s; }
        .f4 { animation: fadeUp .5s ease both .35s; }
        .f5 { animation: fadeUp .5s ease both .45s; }

        .grid-bg {
          background-image:
            linear-gradient(rgba(167,243,208,.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(167,243,208,.07) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .doc-shadow { box-shadow: 0 20px 50px rgba(0,0,0,.28), 0 4px 14px rgba(0,0,0,.14); }
      `}</style>

      <div className="login-root min-h-screen flex flex-col md:flex-row overflow-hidden">
        {/* ═══════════════════════════════════════════════════════
            LEFT — video bg + floating doc cards
        ═══════════════════════════════════════════════════════ */}
        <div
          className="relative hidden md:flex md:w-1/2 lg:w-3/5 overflow-hidden flex-col"
          style={{ background: "#022c22" }}
        >
          {/* ── Video background ── */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: "blur(10px)",
              transform: "scale(1.06)",
              opacity: 0.45,
            }}
          >
            <source src={bonbonVideo} type="video/mp4" />
          </video>

          {/* ── Colour overlays ── */}
          <div className="absolute inset-0 bg-emerald-950/55 mix-blend-multiply" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(155deg,rgba(6,78,59,.82) 0%,rgba(6,95,70,.45) 50%,rgba(4,120,87,.72) 100%)",
            }}
          />

          {/* ── Decorative rings ── */}
          <div
            className="spin-slow absolute top-[14%] right-[7%] w-28 h-28 rounded-full opacity-10"
            style={{ border: "2px dashed #6ee7b7" }}
          />
          <div
            className="spin-slow absolute bottom-[22%] left-[5%] w-20 h-20 rounded-full opacity-10"
            style={{
              border: "2px dashed #34d399",
              animationDirection: "reverse",
            }}
          />

          {/* ── Scattered dots ── */}
          {[
            "w-2 h-2 top-[11%] left-[14%]",
            "w-3 h-3 top-[24%] right-[19%]",
            "w-1.5 h-1.5 top-[54%] left-[7%]",
            "w-2 h-2 top-[69%] right-[24%]",
            "w-2.5 h-2.5 top-[84%] left-[39%]",
            "w-1.5 h-1.5 top-[34%] left-[54%]",
            "w-2 h-2 bottom-[9%] right-[9%]",
          ].map((cls, i) => (
            <div
              key={i}
              className={`absolute rounded-full bg-emerald-400 pdot ${cls}`}
              style={{ animationDelay: `${i * 0.4}s` }}
            />
          ))}

          {/* ═══ CONTENT COLUMN ═══ */}
          <div className="relative z-20 flex flex-col h-full p-12 lg:p-16">
            {/* ── TOP: Logo + headline ── */}
            <div>
              {/* Logo */}
              <div className="flex items-center gap-3 mb-10">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-10 h-10 object-contain brightness-110"
                />
                <div className="w-px h-6 bg-white/20" />
                <div>
                  <p className="df text-white text-base font-bold tracking-tight leading-none">
                    Barangay Bonbon
                  </p>
                  <p className="text-emerald-400 text-[9px] uppercase tracking-[0.2em] font-bold mt-0.5">
                    Document Request System
                  </p>
                </div>
              </div>

              {/* Headline */}
              <h2 className="df text-white text-4xl xl:text-5xl font-black leading-[1.15] tracking-tight mb-3">
                Your documents,
                <br />
                <span className="text-emerald-400">made simple.</span>
              </h2>
            </div>

            {/* ── MIDDLE: Floating document scene ── */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-[400px] h-[340px]">
                {/* Card 1 — Brgy. Clearance (back-left) */}
                <div
                  className="fa absolute doc-shadow"
                  style={{ top: "0%", left: "0%", width: 190 }}
                >
                  <div className="bg-white rounded-2xl p-4 border border-white/70">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <Shield size={13} className="text-white" />
                      </div>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider">
                        Brgy. Clearance
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {[90, 75, 82, 68].map((w, i) => (
                        <div
                          key={i}
                          className="h-1.5 bg-gray-100 rounded-full"
                          style={{ width: `${w}%` }}
                        />
                      ))}
                    </div>
                    {/* Stamp */}
                    <div className="mt-3 flex justify-end">
                      <div className="w-9 h-9 rounded-full border-[2.5px] border-emerald-500 flex items-center justify-center rotate-12 opacity-80">
                        <Stamp size={12} className="text-emerald-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2 — Request Form (centre hero) */}
                <div
                  className="fb absolute doc-shadow"
                  style={{ top: "14%", left: "24%", width: 210, zIndex: 10 }}
                >
                  <div
                    className="rounded-2xl overflow-hidden border border-emerald-200/30"
                    style={{
                      background:
                        "linear-gradient(135deg,#fff 60%,#ecfdf5 100%)",
                    }}
                  >
                    <div
                      className="h-1.5 w-full"
                      style={{
                        background: "linear-gradient(90deg,#10b981,#059669)",
                      }}
                    />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-emerald-500 rounded-xl flex items-center justify-center shadow">
                            <FileText size={13} className="text-white" />
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                              Document
                            </p>
                            <p className="text-[11px] font-black text-gray-700">
                              Request Form
                            </p>
                          </div>
                        </div>
                        <CheckCircle size={14} className="text-emerald-500" />
                      </div>
                      <div className="space-y-2.5">
                        {[
                          ["Full Name", "h-6"],
                          ["Purpose", "h-6"],
                        ].map(([lbl, h]) => (
                          <div key={lbl}>
                            <div className="h-1.5 bg-gray-200 rounded-full w-16 mb-1" />
                            <div
                              className={`${h} bg-gray-50 rounded-lg border border-gray-200 w-full`}
                            />
                          </div>
                        ))}
                      </div>
                      <div
                        className="mt-4 h-6 rounded-lg flex items-center justify-center"
                        style={{
                          background: "linear-gradient(90deg,#10b981,#059669)",
                        }}
                      >
                        <span className="text-white text-[9px] font-black tracking-widest">
                          SUBMIT REQUEST
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3 — Cert. of Residency (bottom-left) */}
                <div
                  className="fc absolute doc-shadow"
                  style={{ bottom: "0%", left: "2%", width: 180 }}
                >
                  <div className="bg-white rounded-2xl p-4 border border-white/70">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-amber-400 rounded-md flex items-center justify-center">
                        <FileBadge size={11} className="text-white" />
                      </div>
                      <span className="text-[9px] font-black text-gray-600 uppercase tracking-wider">
                        Cert. of Residency
                      </span>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {[85, 70, 78].map((w, i) => (
                        <div
                          key={i}
                          className="h-1.5 bg-gray-100 rounded-full"
                          style={{ width: `${w}%` }}
                        />
                      ))}
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 rounded-full">
                      <Clock size={8} className="text-amber-600" />
                      <span className="text-[8px] font-bold text-amber-700">
                        PENDING
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 4 — Indigency (top-right) */}
                <div
                  className="fd absolute doc-shadow"
                  style={{ top: "2%", right: "0%", width: 158 }}
                >
                  <div className="bg-white rounded-2xl p-4 border border-white/70">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
                        <FileBadge size={11} className="text-white" />
                      </div>
                      <span className="text-[9px] font-black text-gray-600 uppercase tracking-wider">
                        Indigency
                      </span>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {[90, 72].map((w, i) => (
                        <div
                          key={i}
                          className="h-1.5 bg-gray-100 rounded-full"
                          style={{ width: `${w}%` }}
                        />
                      ))}
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 rounded-full">
                      <CheckCircle size={8} className="text-emerald-600" />
                      <span className="text-[8px] font-bold text-emerald-700">
                        APPROVED
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 5 — Good Moral (bottom-right) */}
                <div
                  className="fe absolute doc-shadow"
                  style={{ bottom: "0%", right: "0%", width: 150 }}
                >
                  <div className="bg-white rounded-2xl p-4 border border-white/70">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 bg-purple-500 rounded-md flex items-center justify-center">
                        <FileText size={9} className="text-white" />
                      </div>
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
                        Good Moral
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {[88, 74].map((w, i) => (
                        <div
                          key={i}
                          className="h-1.5 bg-gray-100 rounded-full"
                          style={{ width: `${w}%` }}
                        />
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-dashed border-gray-200">
                      <div className="h-1 bg-gray-200 rounded-full w-20" />
                      <p className="text-[7px] text-gray-400 mt-0.5">
                        Signature
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── BOTTOM: Download ── */}
            <div>
              <Link to="/download">
                <div className="group inline-flex items-center gap-4 text-white hover:text-emerald-400 transition-all duration-300">
                  <div className="p-2.5 bg-emerald-500/20 group-hover:bg-emerald-500 border border-emerald-500/30 rounded-full transition-all">
                    <Download size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold tracking-widest text-emerald-300/50">
                      Available for Android
                    </p>
                    <p className="text-sm font-bold">Download Official APK</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
          {/* end content column */}
        </div>
        {/* end left */}

        {/* ═══════════════════════════════════════════════════════
            RIGHT — Login Form
        ═══════════════════════════════════════════════════════ */}
        <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 lg:p-16 bg-white">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="flex items-center gap-3 mb-8 md:hidden">
              <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
              <span className="df text-emerald-700 font-black text-sm">
                Barangay Bonbon DRS
              </span>
            </div>

            {/* Header */}
            <div className="mb-8 f1">
              <h3 className="df text-3xl text-gray-900 font-black tracking-tight mb-1.5">
                Welcome back
              </h3>
              <p className="text-gray-500 text-sm">
                Sign in to manage your document requests.
              </p>
            </div>

            <div className="space-y-5">
              {/* Email */}
              <div className="f2 space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-emerald-500 transition-colors">
                    <User size={17} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="f3 space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-emerald-500 transition-colors">
                    <Lock size={17} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-emerald-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <div className="w-1 h-4 rounded-full bg-red-400 flex-shrink-0" />
                  <p className="text-red-600 text-sm font-semibold">{error}</p>
                </div>
              )}

              {/* hCaptcha */}

              {/* Submit + links */}

              <div className="f5 space-y-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-emerald-100 flex items-center justify-center active:scale-[0.98] disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                  }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="df tracking-widest text-sm">SIGN IN</span>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
                  >
                    Register here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
