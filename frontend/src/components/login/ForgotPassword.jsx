import React, { useState, useRef, useEffect } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Download,
  FileText,
  CheckCircle,
  Clock,
  Shield,
  FileBadge,
  Stamp,
  RefreshCw,
} from "lucide-react";
import logo from "../../assets/logo.png";
import bonbonVideo from "../../assets/bonbonVideo.mp4";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// ─── 3 steps: email → code → new password ────────────────────────────────────
const STEP_EMAIL = "email";
const STEP_CODE = "code";
const STEP_PASSWORD = "password";

const API = import.meta.env.VITE_API_URL ?? "/api";

const ForgotPassword = () => {
  const navigate = useNavigate();

  // ── Step state ───────────────────────────────────────────────────────────
  const [step, setStep] = useState(STEP_EMAIL);

  // Step 1 — email
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Step 2 — OTP code
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [codeError, setCodeError] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [resetToken, setResetToken] = useState(""); // returned after code verify
  const [resendCooldown, setResendCooldown] = useState(0);
  const codeRefs = useRef([]);

  // Step 3 — new password
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passError, setPassError] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [done, setDone] = useState(false);

  // ── Resend countdown ─────────────────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ── Step 1: send OTP ─────────────────────────────────────────────────────
  const handleSendCode = async (e) => {
    e?.preventDefault();
    setEmailError("");
    if (!email.trim()) {
      setEmailError("Email is required.");
      return;
    }
    if (!/^[\w\-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email.trim())) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailLoading(true);
    try {
      await axios.post(`${API}/forgot-password/send`, { email: email.trim() });
      setStep(STEP_CODE);
      setResendCooldown(60);
    } catch (err) {
      setEmailError(
        err.response?.data?.message ?? "Could not send code. Please try again.",
      );
    } finally {
      setEmailLoading(false);
    }
  };

  // ── Step 2: verify OTP ───────────────────────────────────────────────────
  const handleVerifyCode = async (e) => {
    e?.preventDefault();
    const fullCode = code.join("");
    setCodeError("");
    if (fullCode.length < 6) {
      setCodeError("Enter the full 6-digit code.");
      return;
    }
    setCodeLoading(true);
    try {
      const res = await axios.post(`${API}/forgot-password/verify`, {
        email: email.trim(),
        code: fullCode,
      });
      setResetToken(res.data.reset_token);
      setStep(STEP_PASSWORD);
    } catch (err) {
      setCodeError(err.response?.data?.message ?? "Invalid or expired code.");
    } finally {
      setCodeLoading(false);
    }
  };

  // ── Resend OTP ───────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setCodeError("");
    try {
      await axios.post(`${API}/forgot-password/send`, { email: email.trim() });
      setCode(["", "", "", "", "", ""]);
      setResendCooldown(60);
    } catch (err) {
      setCodeError(err.response?.data?.message ?? "Failed to resend code.");
    }
  };

  // ── Code digit input helpers ─────────────────────────────────────────────
  const handleCodeDigit = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    next[i] = val.slice(-1);
    setCode(next);
    if (val && i < 5) codeRefs.current[i + 1]?.focus();
    if (next.every(Boolean)) handleVerifyCode(null, next.join(""));
  };

  const handleCodeKeyDown = (i, e) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      codeRefs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) codeRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) codeRefs.current[i + 1]?.focus();
  };

  const handleCodePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!digits) return;
    const next = digits.split("").concat(Array(6).fill("")).slice(0, 6);
    setCode(next);
    const lastFilled = Math.min(digits.length, 5);
    codeRefs.current[lastFilled]?.focus();
  };

  // ── Step 3: reset password ───────────────────────────────────────────────
  const handleReset = async (e) => {
    e?.preventDefault();
    setPassError("");
    if (password.length < 8) {
      setPassError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setPassError("Passwords do not match.");
      return;
    }
    setPassLoading(true);
    try {
      await axios.post(`${API}/forgot-password/reset`, {
        email: email.trim(),
        reset_token: resetToken,
        password: password,
        password_confirmation: confirm,
      });
      setDone(true);
      setTimeout(() => navigate("/login"), 2800);
    } catch (err) {
      setPassError(
        err.response?.data?.message ??
          "Failed to reset password. Please try again.",
      );
    } finally {
      setPassLoading(false);
    }
  };

  // ── Password strength ────────────────────────────────────────────────────
  const strength = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    if (s <= 1) return { score: s, label: "Weak", color: "#ef4444", w: "20%" };
    if (s === 2) return { score: s, label: "Fair", color: "#f97316", w: "40%" };
    if (s === 3) return { score: s, label: "Good", color: "#eab308", w: "60%" };
    if (s === 4)
      return { score: s, label: "Strong", color: "#10b981", w: "80%" };
    return { score: s, label: "Very Strong", color: "#059669", w: "100%" };
  })();

  // ─────────────────────────────────────────────────────────────────────────
  //  LEFT PANEL (shared across all steps)
  // ─────────────────────────────────────────────────────────────────────────
  const LeftPanel = () => (
    <div
      className="relative hidden md:flex md:w-1/2 lg:w-3/5 overflow-hidden flex-col"
      style={{ background: "#022c22" }}
    >
      {/* Video bg */}
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

      <div className="absolute inset-0 bg-emerald-950/55 mix-blend-multiply" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(155deg,rgba(6,78,59,.82) 0%,rgba(6,95,70,.45) 50%,rgba(4,120,87,.72) 100%)",
        }}
      />

      {/* Rings */}
      <div
        className="spin-slow absolute top-[14%] right-[7%] w-28 h-28 rounded-full opacity-10"
        style={{ border: "2px dashed #6ee7b7" }}
      />
      <div
        className="spin-slow absolute bottom-[22%] left-[5%] w-20 h-20 rounded-full opacity-10"
        style={{ border: "2px dashed #34d399", animationDirection: "reverse" }}
      />

      {/* Dots */}
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

      <div className="relative z-20 flex flex-col h-full p-12 lg:p-16">
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
          Secure account
          <br />
          <span className="text-emerald-400">recovery.</span>
        </h2>
        <p className="text-emerald-200/60 text-sm max-w-xs leading-relaxed mb-10">
          We'll send a one-time code to your email so you can safely set a new
          password.
        </p>

        {/* Floating cards */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-[400px] h-[340px]">
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
                <div className="mt-3 flex justify-end">
                  <div className="w-9 h-9 rounded-full border-[2.5px] border-emerald-500 flex items-center justify-center rotate-12 opacity-80">
                    <Stamp size={12} className="text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            <div
              className="fb absolute doc-shadow"
              style={{ top: "14%", left: "24%", width: 210, zIndex: 10 }}
            >
              <div
                className="rounded-2xl overflow-hidden border border-emerald-200/30"
                style={{
                  background: "linear-gradient(135deg,#fff 60%,#ecfdf5 100%)",
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
          </div>
        </div>

        {/* Bottom link */}
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
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  STEP INDICATOR
  // ─────────────────────────────────────────────────────────────────────────
  const steps = [
    { id: STEP_EMAIL, label: "Email", icon: Mail },
    { id: STEP_CODE, label: "Verify", icon: KeyRound },
    { id: STEP_PASSWORD, label: "Password", icon: Lock },
  ];
  const currentIdx = steps.findIndex((s) => s.id === step);

  const StepIndicator = () => (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const active = i === currentIdx;
        const complete = i < currentIdx;
        return (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                ${complete ? "bg-emerald-500 text-white" : active ? "bg-emerald-50 border-2 border-emerald-500 text-emerald-600" : "bg-gray-100 text-gray-400"}`}
              >
                {complete ? <CheckCircle size={14} /> : <Icon size={13} />}
              </div>
              <span
                className={`text-[9px] font-bold uppercase tracking-widest
                ${active ? "text-emerald-600" : complete ? "text-emerald-400" : "text-gray-400"}`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all duration-500
                ${i < currentIdx ? "bg-emerald-400" : "bg-gray-200"}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        .login-root { font-family: 'DM Sans', sans-serif; }
        .df         { font-family: 'Bricolage Grotesque', sans-serif; }

        @keyframes floatA { 0%,100%{transform:translateY(0)rotate(-6deg)}50%{transform:translateY(-14px)rotate(-6deg)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)rotate(4deg)}50%{transform:translateY(-10px)rotate(4deg)} }
        @keyframes floatC { 0%,100%{transform:translateY(0)rotate(-2deg)}50%{transform:translateY(-18px)rotate(-2deg)} }
        @keyframes floatD { 0%,100%{transform:translateY(0)rotate(8deg)}50%{transform:translateY(-8px)rotate(8deg)} }
        @keyframes spinSlow { to{transform:rotate(360deg)} }
        @keyframes pulseDot { 0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.7;transform:scale(1.4)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn  { from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)} }
        @keyframes popIn    { from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)} }

        .fa{animation:floatA 6s ease-in-out infinite}
        .fb{animation:floatB 7s ease-in-out infinite .5s}
        .fc{animation:floatC 8s ease-in-out infinite 1s}
        .fd{animation:floatD 5.5s ease-in-out infinite 1.5s}
        .spin-slow{animation:spinSlow 20s linear infinite}
        .pdot{animation:pulseDot 3s ease-in-out infinite}
        .f1{animation:fadeUp .45s ease both .05s}
        .f2{animation:fadeUp .45s ease both .15s}
        .f3{animation:fadeUp .45s ease both .25s}
        .f4{animation:fadeUp .45s ease both .35s}
        .f5{animation:fadeUp .45s ease both .45s}
        .slide-in{animation:slideIn .35s ease both}
        .pop-in{animation:popIn .4s cubic-bezier(.34,1.56,.64,1) both}

        .doc-shadow{box-shadow:0 20px 50px rgba(0,0,0,.28),0 4px 14px rgba(0,0,0,.14)}

        .code-digit:focus { border-color:#10b981; box-shadow:0 0 0 3px rgba(16,185,129,.12); }
      `}</style>

      <div className="login-root min-h-screen flex flex-col md:flex-row overflow-hidden">
        <LeftPanel />

        {/* ═══════════════════════════════════════════════════════
            RIGHT — Form panel
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

            {/* ── STEP 1: Enter email ───────────────────────────────────── */}
            {step === STEP_EMAIL && (
              <div key="step-email">
                <StepIndicator />
                <div className="mb-7 f1">
                  <div className="w-11 h-11 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center mb-4">
                    <KeyRound size={20} className="text-emerald-600" />
                  </div>
                  <h3 className="df text-3xl text-gray-900 font-black tracking-tight mb-1.5">
                    Forgot password?
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Enter the email linked to your account and we'll send you a
                    6-digit code.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="f2 space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                        <Mail size={17} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError("");
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSendCode(e)
                        }
                        className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm"
                        placeholder="name@example.com"
                        autoFocus
                      />
                    </div>
                  </div>

                  {emailError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl f2">
                      <div className="w-1 h-4 rounded-full bg-red-400 flex-shrink-0" />
                      <p className="text-red-600 text-sm font-semibold">
                        {emailError}
                      </p>
                    </div>
                  )}

                  <div className="f3 space-y-3 pt-1">
                    <button
                      onClick={handleSendCode}
                      disabled={emailLoading}
                      className="w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-emerald-100 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60"
                      style={{
                        background:
                          "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                      }}
                    >
                      {emailLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Mail size={16} />
                          <span className="df tracking-widest text-sm">
                            SEND CODE
                          </span>
                        </>
                      )}
                    </button>

                    <Link
                      to="/login"
                      className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600 transition-colors font-medium"
                    >
                      <ArrowLeft size={14} /> Back to Sign In
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Enter OTP code ────────────────────────────────── */}
            {step === STEP_CODE && (
              <div key="step-code" className="slide-in">
                <StepIndicator />
                <div className="mb-7">
                  <div className="w-11 h-11 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center mb-4">
                    <ShieldCheck size={20} className="text-emerald-600" />
                  </div>
                  <h3 className="df text-3xl text-gray-900 font-black tracking-tight mb-1.5">
                    Check your email
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    We sent a 6-digit code to{" "}
                    <span className="font-bold text-gray-700">{email}</span>. It
                    expires in 10 minutes.
                  </p>
                </div>

                {/* OTP digit boxes */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                      Verification Code
                    </label>
                    <div className="flex gap-2.5" onPaste={handleCodePaste}>
                      {code.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => (codeRefs.current[i] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeDigit(i, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(i, e)}
                          className="code-digit w-full aspect-square text-center text-xl font-black text-gray-800 border-2 border-gray-200 rounded-xl outline-none transition-all bg-gray-50 focus:bg-white"
                          style={{ fontSize: "1.4rem" }}
                        />
                      ))}
                    </div>
                  </div>

                  {codeError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                      <div className="w-1 h-4 rounded-full bg-red-400 flex-shrink-0" />
                      <p className="text-red-600 text-sm font-semibold">
                        {codeError}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleVerifyCode}
                    disabled={codeLoading || code.join("").length < 6}
                    className="w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-emerald-100 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                    style={{
                      background:
                        "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                    }}
                  >
                    {codeLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span className="df tracking-widest text-sm">
                          VERIFY CODE
                        </span>
                      </>
                    )}
                  </button>

                  {/* Resend + back */}
                  <div className="flex items-center justify-between text-sm pt-1">
                    <button
                      onClick={() => {
                        setStep(STEP_EMAIL);
                        setCode(["", "", "", "", "", ""]);
                        setCodeError("");
                      }}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ArrowLeft size={13} /> Change email
                    </button>
                    <button
                      onClick={handleResend}
                      disabled={resendCooldown > 0}
                      className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <RefreshCw
                        size={13}
                        className={
                          resendCooldown > 0
                            ? ""
                            : "group-hover:rotate-180 transition-transform"
                        }
                      />
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : "Resend code"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: New password ──────────────────────────────────── */}
            {step === STEP_PASSWORD && !done && (
              <div key="step-password" className="slide-in">
                <StepIndicator />
                <div className="mb-7">
                  <div className="w-11 h-11 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center mb-4">
                    <Lock size={20} className="text-emerald-600" />
                  </div>
                  <h3 className="df text-3xl text-gray-900 font-black tracking-tight mb-1.5">
                    New password
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Choose a strong password for your account.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* New password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                      New Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                        <Lock size={17} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setPassError("");
                        }}
                        className="block w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm"
                        placeholder="••••••••"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-emerald-500 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                    {/* Strength bar */}
                    {password && (
                      <div className="pt-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-gray-400 font-medium">
                            Strength
                          </span>
                          <span
                            className="text-[10px] font-bold"
                            style={{ color: strength.color }}
                          >
                            {strength.label}
                          </span>
                        </div>
                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: strength.w,
                              backgroundColor: strength.color,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                        <Lock size={17} />
                      </div>
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => {
                          setConfirm(e.target.value);
                          setPassError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleReset(e)}
                        className={`block w-full pl-11 pr-12 py-3.5 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm
                          ${confirm && password !== confirm ? "border-red-300" : "border-gray-200"}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-emerald-500 transition-colors"
                      >
                        {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {confirm && password !== confirm && (
                      <p className="text-xs text-red-500 font-medium pt-0.5">
                        Passwords do not match.
                      </p>
                    )}
                  </div>

                  {passError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                      <div className="w-1 h-4 rounded-full bg-red-400 flex-shrink-0" />
                      <p className="text-red-600 text-sm font-semibold">
                        {passError}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleReset}
                    disabled={passLoading || !password || !confirm}
                    className="w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-emerald-100 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                    style={{
                      background:
                        "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                    }}
                  >
                    {passLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span className="df tracking-widest text-sm">
                          RESET PASSWORD
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── DONE ─────────────────────────────────────────────────── */}
            {done && (
              <div className="pop-in text-center py-8">
                <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={38} className="text-emerald-500" />
                </div>
                <h3 className="df text-2xl font-black text-gray-900 mb-2">
                  Password reset!
                </h3>
                <p className="text-gray-500 text-sm mb-1">
                  Your password has been updated successfully.
                </p>
                <p className="text-emerald-600 text-sm font-semibold">
                  Redirecting to sign in…
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
