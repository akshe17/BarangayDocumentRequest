import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  Mail,
  Lock,
  MapPin,
  Upload,
  CheckCircle2,
  Eye,
  EyeOff,
  X,
  User,
  Heart,
  Calendar,
  Clock,
  ArrowLeft,
  FileText,
  Shield,
  FileBadge,
  Stamp,
  Download,
  Camera,
  ScanFace,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import api from "../../axious/api";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import bonbonVideo from "../../assets/bonbonVideo.mp4";
import { useAuth } from "../../context/AuthContext";

// ─── FACE++ CONFIG ────────────────────────────────────────────────────────────
// Add these to your .env file:
//   VITE_FACEPP_API_KEY=your_api_key
//   VITE_FACEPP_API_SECRET=your_api_secret
const FACEPP_API_KEY = import.meta.env.VITE_FACEPP_API_KEY || "";
const FACEPP_API_SECRET = import.meta.env.VITE_FACEPP_API_SECRET || "";
const FACEPP_ENDPOINT = "https://api-us.faceplusplus.com/facepp/v3/compare";
// Face++ recommended threshold for KYC (1 in 10,000 false accept rate)
const FACEPP_THRESHOLD = 71.8;

// ─── PASSWORD STRENGTH ───────────────────────────────────────────────────────
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "bg-gray-200" };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-400" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-orange-400" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-yellow-400" };
  if (score === 4)
    return { score: 4, label: "Strong", color: "bg-emerald-400" };
  return { score: 5, label: "Very Strong", color: "bg-emerald-500" };
}

// ─── VERIFICATION PENDING ────────────────────────────────────────────────────
const VerificationPending = ({ email, onBackToLogin }) => (
  <div className="min-h-screen bg-white flex items-center justify-center p-4">
    <div className="max-w-md w-full">
      <div className="bg-white rounded-3xl p-6 sm:p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-100 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 text-emerald-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Registration Successful!
        </h2>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold mb-6">
          <Clock className="w-4 h-4" /> Pending Verification
        </div>
        <div className="space-y-4 mb-8">
          <p className="text-gray-600 leading-relaxed">
            Thank you for registering! Your account has been created
            successfully.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3 text-left">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-900 font-semibold mb-1">
                  What happens next?
                </p>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Our admin team will review your information. We'll send a
                  confirmation to <span className="font-bold">{email}</span>{" "}
                  once verified.
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            This usually takes 1–2 business days.
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            {[
              {
                icon: <CheckCircle2 className="w-5 h-5 text-white" />,
                label: "Registered",
                bg: "bg-emerald-500",
                pulse: false,
              },
              {
                icon: <Clock className="w-5 h-5 text-white" />,
                label: "Reviewing",
                bg: "bg-amber-400",
                pulse: true,
              },
              {
                icon: <Mail className="w-5 h-5 text-gray-500" />,
                label: "Verified",
                bg: "bg-gray-300",
                pulse: false,
              },
            ].map((s, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 ${s.bg} rounded-full flex items-center justify-center mb-2 ${s.pulse ? "animate-pulse" : ""}`}
                  >
                    {s.icon}
                  </div>
                  <span
                    className={`font-medium ${i === 2 ? "text-gray-500" : "text-gray-700"}`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < 2 && <div className="flex-1 h-0.5 bg-gray-300 mx-2" />}
              </React.Fragment>
            ))}
          </div>
        </div>
        <button
          onClick={onBackToLogin}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>
        <p className="text-xs text-gray-500 mt-6">
          Need help? Contact us at{" "}
          <a
            href="mailto:support@barangay.gov"
            className="text-emerald-600 hover:underline font-medium"
          >
            support@barangay.gov
          </a>
        </p>
      </div>
    </div>
  </div>
);

// ─── STEP PROGRESS ───────────────────────────────────────────────────────────
const StepProgress = ({ current }) => {
  const steps = ["Account", "Personal", "Verification"];
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2
                ${
                  done
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : active
                      ? "border-emerald-600 text-emerald-600 bg-white shadow-md shadow-emerald-200"
                      : "border-gray-300 text-gray-400 bg-white"
                }`}
              >
                {done ? <CheckCircle2 size={18} /> : idx}
              </div>
              <span
                className={`mt-2 text-xs font-semibold tracking-wide uppercase ${done || active ? "text-emerald-600" : "text-gray-400"}`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 mb-5 rounded-full transition-all duration-300 ${done ? "bg-emerald-500" : "bg-gray-200"}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── SECTION CARD ────────────────────────────────────────────────────────────
const SectionCard = ({ children }) => (
  <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-7 shadow-sm">
    {children}
  </div>
);

// ─── STEP HEADER ─────────────────────────────────────────────────────────────
const StepHeader = ({ number, title, subtitle }) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
      <span className="text-emerald-700 font-bold text-sm">{number}</span>
    </div>
    <div>
      <h2 className="text-lg font-bold text-gray-800 leading-tight">{title}</h2>
      <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
    </div>
  </div>
);

// ─── INPUT FIELD ─────────────────────────────────────────────────────────────
const InputField = ({
  label,
  icon,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  suffix,
  error,
  children,
}) => (
  <div className="w-full group">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-0.5 mb-2 block group-focus-within:text-emerald-600 transition-colors">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className={`w-full bg-gray-50 border-2 rounded-xl py-3.5 pl-12 pr-12 text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all duration-200
          ${
            error
              ? "border-red-300 focus:border-red-400 bg-red-50/40"
              : "border-gray-300 focus:border-emerald-500 focus:bg-white focus:shadow-sm focus:shadow-emerald-100"
          }`}
      />
      {suffix && (
        <div className="absolute right-0 inset-y-0 flex items-center">
          {suffix}
        </div>
      )}
    </div>
    {children}
    {error && (
      <p className="text-xs text-red-500 mt-1.5 ml-0.5 font-medium">{error}</p>
    )}
  </div>
);

// ─── DATE FIELD ──────────────────────────────────────────────────────────────
const DateField = ({ label, icon, name, value, onChange, max, error }) => (
  <div className="w-full group">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-0.5 mb-2 block group-focus-within:text-emerald-600 transition-colors">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors pointer-events-none z-10">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        max={max}
        className={`w-full bg-gray-50 border-2 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium text-gray-800 outline-none transition-all duration-200 appearance-none cursor-pointer
          ${
            error
              ? "border-red-300 focus:border-red-400 bg-red-50/40"
              : "border-gray-300 focus:border-emerald-500 focus:bg-white focus:shadow-sm focus:shadow-emerald-100"
          }`}
      />
    </div>
    {error && (
      <p className="text-xs text-red-500 mt-1.5 ml-0.5 font-medium">{error}</p>
    )}
  </div>
);

// ─── SELECT FIELD ────────────────────────────────────────────────────────────
const SelectField = ({
  label,
  icon,
  name,
  value,
  onChange,
  options,
  error,
}) => (
  <div className="w-full group">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-0.5 mb-2 block group-focus-within:text-emerald-600 transition-colors">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full bg-gray-50 border-2 rounded-xl py-3.5 pl-12 pr-10 text-sm font-medium text-gray-800 outline-none transition-all duration-200 appearance-none cursor-pointer
          ${
            error
              ? "border-red-300 focus:border-red-400 bg-red-50/40"
              : "border-gray-300 focus:border-emerald-500 focus:bg-white focus:shadow-sm focus:shadow-emerald-100"
          }`}
      >
        <option value="" disabled>
          Select {label}
        </option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
    {error && (
      <p className="text-xs text-red-500 mt-1.5 ml-0.5 font-medium">{error}</p>
    )}
  </div>
);

// ─── FACE SCANNER MODAL — Face++ API ─────────────────────────────────────────
const FaceScanner = ({ idImageSrc, onVerified, onReset, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const lockRef = useRef(false); // prevents concurrent API calls
  const intervalRef = useRef(null); // scan loop handle
  const idB64Ref = useRef(null); // cached ID image base64

  // phase: idle | loading | scanning | analyzing | matched | failed
  const [phase, setPhase] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [scanProgress, setScanProgress] = useState(0);

  // ── Stop everything ──────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    lockRef.current = false;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // ── Grab a video frame as base64 JPEG ───────────────────────────────────
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    // Un-mirror for the API (display is mirrored for natural selfie feel)
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0);
    ctx.restore();
    return canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
  }, []);

  // ── startScanLoop ref so analyzeFrame can call it for auto-retry ─────────
  const startScanLoopRef = useRef(null);

  // ── Send frame + ID to Face++ and check result ───────────────────────────
  const analyzeFrame = useCallback(async () => {
    if (lockRef.current) return;
    lockRef.current = true;

    // Pause the loop while waiting for the API
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const selfieB64 = captureFrame();
    if (!selfieB64) {
      lockRef.current = false;
      startScanLoopRef.current?.();
      return;
    }

    setPhase("analyzing");

    try {
      // Face++ requires multipart/form-data (NOT JSON)
      const form = new FormData();
      form.append("api_key", FACEPP_API_KEY);
      form.append("api_secret", FACEPP_API_SECRET);
      form.append("image_base64_1", idB64Ref.current); // Government ID photo
      form.append("image_base64_2", selfieB64); // Live camera selfie

      const res = await fetch(FACEPP_ENDPOINT, { method: "POST", body: form });
      const data = await res.json();

      // error_message means no face was detected in the frame — silently retry
      if (data.error_message) {
        lockRef.current = false;
        setPhase("scanning");
        startScanLoopRef.current?.();
        return;
      }

      // Use Face++'s returned 1e-4 threshold, fall back to our constant
      const confidence = data.confidence ?? 0;
      const threshold = data.thresholds?.["1e-4"] ?? FACEPP_THRESHOLD;

      if (confidence >= threshold) {
        stopCamera();
        setPhase("matched");
        setTimeout(() => onVerified(), 1400);
      } else {
        stopCamera();
        setErrorMsg(
          `Similarity score too low (${confidence.toFixed(1)} / ${threshold.toFixed(1)} required). ` +
            "Try better lighting or look directly at the camera.",
        );
        setPhase("failed");
      }
    } catch {
      // Network/API error — auto-retry silently
      lockRef.current = false;
      setPhase("scanning");
      startScanLoopRef.current?.();
    }
  }, [captureFrame, stopCamera, onVerified]);

  // ── Progress-bar scan loop: 2.5s fill → fire analyzeFrame ───────────────
  const startScanLoop = useCallback(() => {
    setScanProgress(0);
    const TOTAL = 2500,
      TICK = 50;
    let elapsed = 0;
    intervalRef.current = setInterval(() => {
      elapsed += TICK;
      setScanProgress(Math.min(100, Math.round((elapsed / TOTAL) * 100)));
      if (elapsed >= TOTAL) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        analyzeFrame();
      }
    }, TICK);
  }, [analyzeFrame]);

  // Keep ref in sync so analyzeFrame can always call the latest startScanLoop
  useEffect(() => {
    startScanLoopRef.current = startScanLoop;
  }, [startScanLoop]);

  // ── Open camera, cache ID base64, kick off scan loop ────────────────────
  const startCamera = useCallback(async () => {
    setPhase("loading");
    setErrorMsg("");
    lockRef.current = false;

    // Fetch & cache the ID image as base64 (done only once per session)
    if (!idB64Ref.current) {
      try {
        const blob = await fetch(idImageSrc).then((r) => r.blob());
        idB64Ref.current = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch {
        setErrorMsg("Could not load your ID image. Please re-upload it.");
        setPhase("failed");
        return;
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stopCamera();
        return;
      }

      video.srcObject = stream;
      // Must wait for loadedmetadata before calling play() — required by all browsers
      video.onloadedmetadata = () => {
        video
          .play()
          .then(() => {
            setPhase("scanning");
            setTimeout(() => startScanLoop(), 600); // half-second settle time
          })
          .catch(() => {
            setErrorMsg("Could not start video stream. Please try again.");
            setPhase("failed");
            stopCamera();
          });
      };
    } catch {
      setErrorMsg(
        "Camera access was denied. Please allow camera permissions and try again.",
      );
      setPhase("failed");
    }
  }, [idImageSrc, stopCamera, startScanLoop]);

  const brackets = [
    "top-5 left-5 border-t-2 border-l-2",
    "top-5 right-5 border-t-2 border-r-2",
    "bottom-5 left-5 border-b-2 border-l-2",
    "bottom-5 right-5 border-b-2 border-r-2",
  ];

  // ── Handle close — stop camera first ─────────────────────────────────────
  const handleClose = () => {
    stopCamera();
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div
        className="relative w-full max-w-2xl bg-gray-950 rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/20 flex flex-col"
        style={{ maxHeight: "92vh" }}
      >
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gray-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <ScanFace size={18} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight">
                Face Verification
              </h2>
              <p className="text-white/40 text-xs mt-0.5">
                Match your face with your uploaded ID
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Camera Viewport ── */}
        <div
          className="relative bg-black flex items-center justify-center"
          style={{ minHeight: 380 }}
        >
          {/* Live video */}
          <video
            ref={videoRef}
            muted
            playsInline
            className="w-full object-cover"
            style={{
              maxHeight: 420,
              transform: "scaleX(-1)",
              display:
                phase === "scanning" || phase === "analyzing"
                  ? "block"
                  : "none",
            }}
          />
          {/* Off-screen canvas for frame capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* IDLE */}
          {phase === "idle" && (
            <div className="flex flex-col items-center justify-center gap-5 p-12 text-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                  <Camera size={44} className="text-emerald-400" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400/20 animate-ping" />
              </div>
              <div className="space-y-2">
                <p className="text-white font-semibold text-base">
                  Ready to verify your identity
                </p>
                <p className="text-white/50 text-sm max-w-xs leading-relaxed">
                  Position your face in good lighting. Scanning starts
                  automatically once the camera opens.
                </p>
              </div>
              <button
                type="button"
                onClick={startCamera}
                className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all shadow-lg shadow-emerald-900/50"
              >
                <Camera size={18} /> Open Camera
              </button>
            </div>
          )}

          {/* LOADING */}
          {phase === "loading" && (
            <div className="flex flex-col items-center gap-4 p-12 text-center">
              <div className="w-14 h-14 rounded-full border-4 border-emerald-400/30 border-t-emerald-400 animate-spin" />
              <p className="text-white/70 text-sm font-medium">
                Starting camera…
              </p>
            </div>
          )}

          {/* SCANNING overlay */}
          {phase === "scanning" && (
            <div className="absolute inset-0 pointer-events-none">
              {brackets.map((cls, i) => (
                <div
                  key={i}
                  className={`absolute w-10 h-10 border-emerald-400 ${cls}`}
                />
              ))}
              <div
                className="absolute left-10 right-10 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80"
                style={{ animation: "faceScanSweep 1.8s ease-in-out infinite" }}
              />
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 pt-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white/90 text-xs font-semibold tracking-wide">
                    Scanning… stay still
                  </span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${scanProgress}%`, transition: "none" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ANALYZING overlay */}
          {phase === "analyzing" && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-400/30 border-t-emerald-400 animate-spin" />
                <div
                  className="absolute inset-2 rounded-full border-2 border-emerald-500/20 border-b-emerald-300 animate-spin"
                  style={{
                    animationDirection: "reverse",
                    animationDuration: "1.2s",
                  }}
                />
              </div>
              <div className="text-center space-y-1.5">
                <p className="text-white font-bold text-base">
                  Comparing with ID…
                </p>
                <p className="text-white/40 text-xs">Powered by Face++</p>
              </div>
            </div>
          )}

          {/* MATCHED */}
          {phase === "matched" && (
            <div className="flex flex-col items-center gap-5 p-12 text-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
                  <CheckCircle2 size={52} className="text-emerald-400" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-ping" />
              </div>
              <div className="space-y-1.5">
                <p className="text-emerald-300 font-bold text-xl">
                  Face Matched!
                </p>
                <p className="text-white/60 text-sm">
                  Identity confirmed. Proceeding…
                </p>
              </div>
            </div>
          )}

          {/* FAILED */}
          {phase === "failed" && (
            <div className="flex flex-col items-center gap-5 p-10 text-center">
              <div className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center">
                <AlertTriangle size={44} className="text-red-400" />
              </div>
              <div className="space-y-2">
                <p className="text-red-300 font-bold text-lg">
                  Verification Failed
                </p>
                <p className="text-white/60 text-sm max-w-xs leading-relaxed">
                  {errorMsg || "Face could not be verified. Please try again."}
                </p>
              </div>
              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw size={14} /> Try Again
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onReset();
                    handleClose();
                  }}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl text-sm font-semibold transition-all"
                >
                  Change ID
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Tips Footer ── */}
        <div className="px-6 py-4 bg-gray-900/60 border-t border-white/10 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 mt-0.5 shrink-0 text-emerald-400">
              <Shield size={16} />
            </div>
            <p className="text-white/40 text-xs leading-relaxed">
              For best results: ensure good lighting, remove glasses, and look
              directly at the camera. Your face must match the photo on your
              uploaded ID.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes faceScanSweep {
          0%   { top: 10%; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [genders, setGenders] = useState([]);
  const [civilStatus, setCivilStatus] = useState([]);
  const [zones, setZones] = useState([]);
  const [showVerificationPending, setShowVerificationPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);

  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const { isAuthenticated, isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fname: "",
    mname: "",
    lname: "",
    birthdate: "",
    house_no: "",
    zone: "",
    gender_id: "",
    civil_status_id: "",
  });

  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password],
  );

  if (isAuthenticated)
    return <Navigate to={isAdmin() ? "/dashboard" : "/resident"} replace />;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nameOnly = /^[A-Za-zÀ-ÿ\s.'-]*$/;
    if (["fname", "mname", "lname"].includes(name) && !nameOnly.test(value)) {
      setErrors((p) => ({
        ...p,
        [name]: "Only letters and spaces are allowed.",
      }));
      return;
    }
    if (name === "house_no" && !/^[A-Za-z0-9\s]*$/.test(value)) {
      setErrors((p) => ({
        ...p,
        house_no: "Only letters, numbers, and spaces are allowed.",
      }));
      return;
    }
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setImageFile(file);
      setFaceVerified(false);
      if (errors.id_image) setErrors((p) => ({ ...p, id_image: null }));
    }
  };

  const removeImage = (e) => {
    if (e?.preventDefault) e.preventDefault();
    setSelectedImage(null);
    setImageFile(null);
    setFaceVerified(false);
  };

  // ── Registration submit ───────────────────────────────────────────────────
  const handleRegistration = async () => {
    setErrors({});
    if (!imageFile) {
      setErrors({ id_image: "Please upload a valid ID image" });
      return;
    }
    setIsSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach((k) => {
      if (k !== "confirmPassword") data.append(k, formData[k]);
    });
    data.append("id_image", imageFile);
    try {
      const response = await api.post("/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.status === "pending_verification") {
        setRegisteredEmail(response.data.email);
        setShowVerificationPending(true);
      }
    } catch (err) {
      if (err.response?.data) {
        if (err.response.status === 422)
          setErrors(err.response.data.errors || {});
        else
          setErrors({
            general: err.response.data.message || "Something went wrong",
          });
      } else {
        setErrors({ general: "An unexpected error occurred." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Fetch dropdowns on mount ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [gRes, cRes, zRes] = await Promise.all([
          api.get("/genders"),
          api.get("/civil-status"),
          api.get("/zones"),
        ]);
        setGenders(
          Array.isArray(gRes.data) ? gRes.data : (gRes.data?.data ?? []),
        );
        setCivilStatus(
          Array.isArray(cRes.data) ? cRes.data : (cRes.data?.data ?? []),
        );
        setZones(
          Array.isArray(zRes.data) ? zRes.data : (zRes.data?.data ?? []),
        );
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      }
    })();
  }, []);

  // ── Validation ────────────────────────────────────────────────────────────
  const passwordMatchError =
    formData.confirmPassword && formData.password !== formData.confirmPassword
      ? "Passwords do not match"
      : "";

  const birthdateError = (() => {
    if (!formData.birthdate) return "";
    const birth = new Date(formData.birthdate),
      now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age < 18 ? "You must be at least 18 years old" : "";
  })();

  const section1Valid =
    formData.email.includes("@") &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword;
  const section2Valid = !!(
    formData.fname.trim() &&
    formData.lname.trim() &&
    formData.birthdate &&
    !birthdateError &&
    formData.gender_id
  );
  const isFormValid =
    section1Valid && section2Valid && !!selectedImage && faceVerified;

  useEffect(() => {
    if (section1Valid && section2Valid) setCurrentStep(3);
    else if (section1Valid) setCurrentStep(2);
    else setCurrentStep(1);
  }, [section1Valid, section2Valid]);

  if (showVerificationPending)
    return (
      <VerificationPending
        email={registeredEmail}
        onBackToLogin={() => navigate("/login")}
      />
    );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        .reg-root  { font-family: 'DM Sans', sans-serif; }
        .df        { font-family: 'Bricolage Grotesque', sans-serif; }

        @keyframes floatA   { 0%,100%{transform:translateY(0px) rotate(-6deg)}  50%{transform:translateY(-14px) rotate(-6deg)}  }
        @keyframes floatB   { 0%,100%{transform:translateY(0px) rotate(4deg)}   50%{transform:translateY(-10px) rotate(4deg)}   }
        @keyframes floatC   { 0%,100%{transform:translateY(0px) rotate(-2deg)}  50%{transform:translateY(-18px) rotate(-2deg)}  }
        @keyframes floatD   { 0%,100%{transform:translateY(0px) rotate(8deg)}   50%{transform:translateY(-8px)  rotate(8deg)}   }
        @keyframes floatE   { 0%,100%{transform:translateY(0px) rotate(-12deg)} 50%{transform:translateY(-12px) rotate(-12deg)} }
        @keyframes spinSlow { to { transform: rotate(360deg); } }
        @keyframes pulseDot { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.7;transform:scale(1.4)} }

        .fa        { animation: floatA   6s   ease-in-out infinite;       }
        .fb        { animation: floatB   7s   ease-in-out infinite  0.5s; }
        .fc        { animation: floatC   8s   ease-in-out infinite  1.0s; }
        .fd        { animation: floatD   5.5s ease-in-out infinite  1.5s; }
        .fe        { animation: floatE   9s   ease-in-out infinite  2.0s; }
        .spin-slow { animation: spinSlow 20s  linear     infinite;        }
        .pdot      { animation: pulseDot 3s   ease-in-out infinite;       }
        .doc-shadow { box-shadow: 0 20px 50px rgba(0,0,0,.28), 0 4px 14px rgba(0,0,0,.14); }
      `}</style>

      <div className="reg-root min-h-screen flex flex-col md:flex-row bg-gray-100">
        {/* ══ LEFT PANEL ════════════════════════════════════════════════════ */}
        <aside className="hidden md:block md:w-[38%] lg:w-[42%] shrink-0">
          <div
            className="sticky top-0 h-screen overflow-hidden relative"
            style={{ background: "#022c22" }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                filter: "blur(3px)",
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
            <div className="absolute inset-0 grid-bg pointer-events-none" />
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

            <div className="relative z-20 flex flex-col h-full p-10 lg:p-12">
              <div>
                <div className="flex items-center gap-3 mb-10">
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-9 h-9 object-contain brightness-110"
                  />
                  <div className="w-px h-5 bg-white/20" />
                  <div>
                    <p className="df text-white text-sm font-bold tracking-tight leading-none">
                      Barangay Bonbon
                    </p>
                    <p className="text-emerald-400 text-[9px] uppercase tracking-[0.2em] font-bold mt-0.5">
                      Document Request System
                    </p>
                  </div>
                </div>
                <h2 className="df text-white text-3xl md:text-6xl font-black leading-[1.15] tracking-tight mb-3">
                  Let's get
                  <br />
                  <span className="text-emerald-400">started.</span>
                </h2>
              </div>

              {/* Floating doc cards */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-[340px] h-[310px]">
                  <div
                    className="fa absolute doc-shadow"
                    style={{ top: "0%", left: "0%", width: 180 }}
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
                        <div className="w-8 h-8 rounded-full border-[2.5px] border-emerald-500 flex items-center justify-center rotate-12 opacity-80">
                          <Stamp size={11} className="text-emerald-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="fb absolute doc-shadow"
                    style={{ top: "14%", left: "22%", width: 200, zIndex: 10 }}
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
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-emerald-500 rounded-xl flex items-center justify-center">
                              <FileText size={12} className="text-white" />
                            </div>
                            <div>
                              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                Document
                              </p>
                              <p className="text-[10px] font-black text-gray-700">
                                Request Form
                              </p>
                            </div>
                          </div>
                          <CheckCircle2
                            size={13}
                            className="text-emerald-500"
                          />
                        </div>
                        <div className="space-y-2">
                          {[
                            ["Full Name", "h-5"],
                            ["Purpose", "h-5"],
                          ].map(([l, h]) => (
                            <div key={l}>
                              <div className="h-1.5 bg-gray-200 rounded-full w-14 mb-1" />
                              <div
                                className={`${h} bg-gray-50 rounded-lg border border-gray-200 w-full`}
                              />
                            </div>
                          ))}
                        </div>
                        <div
                          className="mt-3 h-5 rounded-lg flex items-center justify-center"
                          style={{
                            background:
                              "linear-gradient(90deg,#10b981,#059669)",
                          }}
                        >
                          <span className="text-white text-[8px] font-black tracking-widest">
                            SUBMIT REQUEST
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="fc absolute doc-shadow"
                    style={{ bottom: "0%", left: "0%", width: 172 }}
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
                    style={{ top: "0%", right: "0%", width: 150 }}
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
                        <CheckCircle2 size={8} className="text-emerald-600" />
                        <span className="text-[8px] font-bold text-emerald-700">
                          APPROVED
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="fe absolute doc-shadow"
                    style={{ bottom: "0%", right: "0%", width: 142 }}
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
                        <div className="h-1 bg-gray-200 rounded-full w-16" />
                        <p className="text-[7px] text-gray-400 mt-0.5">
                          Signature
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Link to="/download">
                  <div className="group inline-flex items-center gap-4 text-white hover:text-emerald-400 transition-all duration-300">
                    <div className="p-2.5 bg-emerald-500/20 group-hover:bg-emerald-500 border border-emerald-500/30 rounded-full transition-all">
                      <Download size={17} className="text-white" />
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
        </aside>

        {/* ══ RIGHT — Form ══════════════════════════════════════════════════ */}
        <main className="flex-1 min-h-screen overflow-y-auto bg-gray-100">
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500" />
          <div className="max-w-2xl mx-auto px-5 py-12 md:px-8 md:py-16">
            <div className="text-center mb-8">
              <h2 className="df text-2xl font-bold text-gray-800">
                Create your account
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the details below to register as a resident.
              </p>
            </div>

            <StepProgress current={currentStep} />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRegistration();
              }}
              className="space-y-5"
            >
              {/* Section 1 — Account */}
              <SectionCard>
                <StepHeader
                  number="1"
                  title="Account Details"
                  subtitle="Set up your login credentials."
                />
                <div className="space-y-4">
                  <InputField
                    label="Email Address"
                    name="email"
                    icon={<Mail />}
                    placeholder="you@email.com"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Password"
                      name="password"
                      icon={<Lock />}
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      error={errors.password}
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="pr-4 text-gray-300 hover:text-emerald-600"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      }
                    >
                      {formData.password && (
                        <div className="mt-2 ml-0.5">
                          <div className="flex gap-1.5 h-1.5 mb-1.5">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`flex-1 rounded-full transition-colors duration-300 ${i < passwordStrength.score ? passwordStrength.color : "bg-gray-200"}`}
                              />
                            ))}
                          </div>
                          <p
                            className={`text-xs font-semibold ${passwordStrength.score < 3 ? "text-red-500" : "text-emerald-600"}`}
                          >
                            {passwordStrength.label}
                          </p>
                        </div>
                      )}
                    </InputField>
                    <InputField
                      label="Confirm Password"
                      name="confirmPassword"
                      icon={<Lock />}
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      error={passwordMatchError}
                    />
                  </div>
                </div>
              </SectionCard>

              {/* Section 2 — Personal */}
              <SectionCard>
                <StepHeader
                  number="2"
                  title="Personal & Residency"
                  subtitle="Tell us about yourself and where you live."
                />
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputField
                      label="First Name"
                      name="fname"
                      icon={<User />}
                      placeholder="Juan"
                      value={formData.fname}
                      onChange={handleInputChange}
                      error={errors.fname}
                    />
                    <InputField
                      label={
                        <span className="flex items-center gap-1">
                          Middle Name{" "}
                          <span className="text-gray-400 text-[10px] normal-case tracking-normal font-normal">
                            (optional)
                          </span>
                        </span>
                      }
                      name="mname"
                      icon={<User />}
                      placeholder="Santos"
                      value={formData.mname}
                      onChange={handleInputChange}
                      error={errors.mname}
                    />
                    <InputField
                      label="Last Name"
                      name="lname"
                      icon={<User />}
                      placeholder="Dela Cruz"
                      value={formData.lname}
                      onChange={handleInputChange}
                      error={errors.lname}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DateField
                      label="Date of Birth"
                      name="birthdate"
                      icon={<Calendar />}
                      value={formData.birthdate}
                      onChange={handleInputChange}
                      max={today}
                      error={birthdateError || errors.birthdate}
                    />
                    <SelectField
                      label="Gender"
                      name="gender_id"
                      icon={<User />}
                      value={formData.gender_id}
                      onChange={handleInputChange}
                      options={genders.map((g) => ({
                        id: g.gender_id,
                        label: g.gender_name,
                      }))}
                      error={errors.gender_id}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectField
                      label="Zone"
                      name="zone"
                      icon={<MapPin />}
                      value={formData.zone}
                      onChange={handleInputChange}
                      options={zones.map((z) => ({
                        id: z.zone_id,
                        label: z.zone_name,
                      }))}
                      error={errors.zone}
                    />
                    <InputField
                      label="House No."
                      name="house_no"
                      icon={<MapPin />}
                      placeholder="123 Mabini St."
                      value={formData.house_no}
                      onChange={handleInputChange}
                      error={errors.house_no}
                    />
                  </div>
                  <SelectField
                    label="Marital Status"
                    name="civil_status_id"
                    icon={<Heart />}
                    value={formData.civil_status_id}
                    onChange={handleInputChange}
                    options={civilStatus.map((s) => ({
                      id: s.civil_status_id,
                      label: s.status_name,
                    }))}
                    error={errors.civil_status_id}
                  />
                </div>
              </SectionCard>

              {/* Section 3 — ID Upload */}
              <SectionCard>
                <StepHeader
                  number="3"
                  title="Verification"
                  subtitle="Upload a valid government-issued ID."
                />
                {!selectedImage ? (
                  <label
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all duration-200 group
                    ${errors.id_image ? "border-red-300 bg-red-50/30" : "border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/40"}`}
                  >
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${errors.id_image ? "bg-red-100" : "bg-emerald-50 group-hover:bg-emerald-100"}`}
                    >
                      <Upload
                        size={24}
                        className={
                          errors.id_image ? "text-red-600" : "text-emerald-600"
                        }
                      />
                    </div>
                    <h3
                      className={`text-sm font-bold ${errors.id_image ? "text-red-700" : "text-gray-700 group-hover:text-emerald-700"}`}
                    >
                      Upload Valid ID
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG or JPG, up to 10 MB
                    </p>
                    {errors.id_image && (
                      <p className="text-xs text-red-500 mt-2 font-medium">
                        {errors.id_image}
                      </p>
                    )}
                  </label>
                ) : (
                  <div className="relative border-2 border-emerald-400 bg-emerald-50/30 rounded-xl overflow-hidden flex flex-col items-center justify-center p-3">
                    <img
                      src={selectedImage}
                      alt="ID Preview"
                      className="max-h-64 w-auto object-contain"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur text-red-500 hover:text-red-600 hover:bg-white p-1.5 rounded-lg shadow-sm border border-gray-100 transition-all"
                    >
                      <X size={16} />
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/95 mt-2 rounded-lg">
                      <CheckCircle2 size={14} className="text-white" />
                      <span className="text-white text-xs font-bold">
                        ID successfully attached
                      </span>
                    </div>
                  </div>
                )}
              </SectionCard>

              {/* Section 4 — Face Verification (appears after ID is uploaded) */}
              {selectedImage && !faceVerified && (
                <SectionCard>
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                      <ScanFace size={16} className="text-emerald-700" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800 leading-tight">
                        Face Verification
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Verify your identity by matching your face to your
                        uploaded ID.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFaceModal(true)}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-200"
                  >
                    <ScanFace size={18} /> Start Face Scan
                  </button>
                </SectionCard>
              )}

              {/* Face Verification Modal */}
              {showFaceModal && (
                <FaceScanner
                  idImageSrc={selectedImage}
                  onVerified={() => {
                    setFaceVerified(true);
                    setShowFaceModal(false);
                  }}
                  onReset={removeImage}
                  onClose={() => setShowFaceModal(false)}
                />
              )}

              {/* Face verified badge */}
              {selectedImage && faceVerified && (
                <div className="flex items-center gap-3 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <ScanFace size={18} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-emerald-800">
                      Face Verified
                    </p>
                    <p className="text-xs text-emerald-600">
                      Your face matches the submitted ID.
                    </p>
                  </div>
                  <CheckCircle2 size={20} className="text-emerald-500" />
                </div>
              )}

              {/* Submit */}
              <div className="pt-3">
                {Object.keys(errors).length > 0 && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6">
                    <strong className="font-bold">
                      There were errors with your submission:
                    </strong>
                    <ul className="list-disc list-inside mt-2">
                      {Object.entries(errors).map(([k, v]) => (
                        <li key={k}>{Array.isArray(v) ? v[0] : v}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className={`w-full py-4 rounded-xl font-bold text-base shadow-md transition-all duration-200 flex items-center justify-center gap-2.5
                    ${
                      isFormValid && !isSubmitting
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 active:scale-[0.98]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{" "}
                      Processing…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} /> Complete Registration
                    </>
                  )}
                </button>
                <p className="text-center mt-6 text-sm text-gray-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-emerald-600 font-bold hover:text-emerald-700"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
};

export default Register;
