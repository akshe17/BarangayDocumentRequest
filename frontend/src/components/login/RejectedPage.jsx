import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  XCircle,
  ArrowLeft,
  Mail,
  UploadCloud,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ImageUp,
  ScanFace,
  Camera,
  AlertTriangle,
  RefreshCw,
  Shield,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../axious/api";

// ─── FACE++ CONFIG ─────────────────────────────────────────────────────────────
const FACEPP_API_KEY = import.meta.env.VITE_FACEPP_API_KEY || "";
const FACEPP_API_SECRET = import.meta.env.VITE_FACEPP_API_SECRET || "";
const FACEPP_ENDPOINT = "https://api-us.faceplusplus.com/facepp/v3/compare";
const FACEPP_THRESHOLD = 71.8;

// ─── FACE SCANNER MODAL ────────────────────────────────────────────────────────
const FaceScanner = ({ idImageSrc, onVerified, onReset, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const lockRef = useRef(false);
  const intervalRef = useRef(null);
  const idB64Ref = useRef(null);
  const startScanLoopRef = useRef(null);

  const [phase, setPhase] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [scanProgress, setScanProgress] = useState(0);

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

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0);
    ctx.restore();
    return canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
  }, []);

  const analyzeFrame = useCallback(async () => {
    if (lockRef.current) return;
    lockRef.current = true;
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
      const form = new FormData();
      form.append("api_key", FACEPP_API_KEY);
      form.append("api_secret", FACEPP_API_SECRET);
      form.append("image_base64_1", idB64Ref.current);
      form.append("image_base64_2", selfieB64);
      const res = await fetch(FACEPP_ENDPOINT, { method: "POST", body: form });
      const data = await res.json();
      if (data.error_message) {
        lockRef.current = false;
        setPhase("scanning");
        startScanLoopRef.current?.();
        return;
      }
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
      lockRef.current = false;
      setPhase("scanning");
      startScanLoopRef.current?.();
    }
  }, [captureFrame, stopCamera, onVerified]);

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

  useEffect(() => {
    startScanLoopRef.current = startScanLoop;
  }, [startScanLoop]);

  const startCamera = useCallback(async () => {
    setPhase("loading");
    setErrorMsg("");
    lockRef.current = false;
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
      video.onloadedmetadata = () => {
        video
          .play()
          .then(() => {
            setPhase("scanning");
            setTimeout(() => startScanLoop(), 600);
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

  const handleClose = () => {
    stopCamera();
    onClose?.();
  };

  const brackets = [
    "top-5 left-5 border-t-2 border-l-2",
    "top-5 right-5 border-t-2 border-r-2",
    "bottom-5 left-5 border-b-2 border-l-2",
    "bottom-5 right-5 border-b-2 border-r-2",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div
        className="relative w-full max-w-2xl bg-gray-950 rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/20 flex flex-col"
        style={{ maxHeight: "92vh" }}
      >
        {/* Header */}
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

        {/* Camera viewport */}
        <div
          className="relative bg-black flex items-center justify-center"
          style={{ minHeight: 380 }}
        >
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

          {/* ANALYZING */}
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

        {/* Tips footer */}
        <div className="px-6 py-4 bg-gray-900/60 border-t border-white/10 shrink-0">
          <div className="flex items-start gap-3">
            <Shield size={16} className="text-emerald-400 mt-0.5 shrink-0" />
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

// ─── ACCEPTED IDs LIST ─────────────────────────────────────────────────────────
const ALL_IDS = [
  { label: "Philippine National ID (PhilSys)", primary: true },
  { label: "Driver's License", primary: true },
  { label: "Philippine Passport", primary: true },
  { label: "Unified Multi-Purpose ID (UMID)", primary: true },
  { label: "SSS ID", primary: true },
  { label: "GSIS eCard", primary: true },
  { label: "Voter's ID", primary: true },
  { label: "Postal ID", primary: true },
  { label: "PhilHealth ID", primary: true },
  { label: "TIN ID", primary: true },
  { label: "School ID (current year)", primary: false },
  { label: "Company ID", primary: false },
  { label: "Senior Citizen ID", primary: false },
];

const VISIBLE_BY_DEFAULT = 4;

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
const RejectedPage = ({ userId }) => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showAllIds, setShowAllIds] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const visibleIds = showAllIds
    ? ALL_IDS
    : ALL_IDS.slice(0, VISIBLE_BY_DEFAULT);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setError("");
    setMessage("");
    // Reset face verification whenever a new ID is picked
    setFaceVerified(false);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setFaceVerified(false);
    setError("");
    setMessage("");
  };

  const handleResubmit = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    if (!faceVerified) {
      setError("Please complete face verification first.");
      return;
    }
    if (!userId) {
      setError("User ID missing. Please login again.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");
    const formData = new FormData();
    formData.append("id_image", file);
    formData.append("user_id", userId);
    formData.append("_method", "PUT");
    try {
      await api.post("/resident/resubmit-id", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("ID uploaded! Your account is now pending re-review.");
      setSubmitted(true); // lock the form permanently after success
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to upload. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] flex flex-col items-center justify-center p-4 py-10">
      <div className="w-full max-w-md space-y-3">
        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1 bg-red-500 w-full" />
          <div className="px-6 py-6 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <XCircle size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-0.5">
                Registration Status
              </p>
              <h2 className="text-base font-black text-gray-900 leading-tight">
                Request Rejected
              </h2>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Your ID was not approved by the Barangay administrator. Resubmit
                a valid, clear photo to be re-evaluated.
              </p>
            </div>
          </div>
        </div>

        {/* Accepted IDs card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2.5">
            <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
            <p className="text-xs font-black text-gray-700">
              Accepted Valid IDs
            </p>
          </div>
          <div className="px-5 pt-3 pb-1">
            <div className="space-y-1.5">
              {visibleIds.map((id, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span
                    className={
                      "w-1.5 h-1.5 rounded-full shrink-0 " +
                      (id.primary ? "bg-emerald-500" : "bg-sky-400")
                    }
                  />
                  <p className="text-xs text-gray-600 font-medium">
                    {id.label}
                  </p>
                  {!id.primary && (
                    <span className="ml-auto text-[9px] font-bold text-sky-500 bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded-full">
                      conditional
                    </span>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAllIds((v) => !v)}
              className="w-full flex items-center justify-center gap-1.5 py-3 mt-2 text-[11px] font-bold text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              {showAllIds ? (
                <>
                  <ChevronUp size={13} /> Show less
                </>
              ) : (
                <>
                  <ChevronDown size={13} /> See all {ALL_IDS.length} accepted
                  IDs
                </>
              )}
            </button>
          </div>
        </div>

        {/* Upload card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2.5">
            <UploadCloud size={14} className="text-emerald-500 shrink-0" />
            <p className="text-xs font-black text-gray-700">
              Resubmit Valid ID
            </p>
          </div>
          <div className="p-5 space-y-3">
            {/* ── Submitted lock state ── */}
            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <CheckCircle2 size={28} className="text-emerald-500" />
                </div>
                <p className="text-sm font-black text-emerald-800">
                  Resubmission Received
                </p>
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
                  Your ID has been submitted for re-review. You cannot submit
                  again while your application is pending.
                </p>
              </div>
            ) : (
              <>
                {/* File picker / preview */}
                {!previewUrl ? (
                  <label className="group flex flex-col items-center justify-center gap-2 w-full py-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-gray-50 hover:bg-emerald-50/60 hover:border-emerald-300 transition-all">
                    <ImageUp
                      size={20}
                      className="text-gray-300 group-hover:text-emerald-400 transition-colors"
                    />
                    <p className="text-xs font-bold text-gray-400 group-hover:text-emerald-600 transition-colors">
                      Tap to choose a photo
                    </p>
                    <p className="text-[10px] text-gray-300">
                      JPG, PNG · max 10MB
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-emerald-100 bg-emerald-50/30 p-2">
                    <img
                      src={previewUrl}
                      alt="ID Preview"
                      className="max-h-40 rounded-lg mx-auto object-contain"
                    />
                    {/* Only allow removing if not yet face-verified */}
                    {!faceVerified && (
                      <button
                        onClick={handleRemoveFile}
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur text-red-500 hover:text-red-600 hover:bg-white p-1.5 rounded-lg shadow-sm border border-gray-100 transition-all"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <div className="flex items-center justify-center gap-2 px-4 py-2 mt-2">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-700">
                        {file?.name}
                      </span>
                    </div>
                  </div>
                )}

                {/* Face scan prompt — shown after file selected, before verification */}
                {previewUrl && !faceVerified && (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
                      <ScanFace
                        size={13}
                        className="text-emerald-500 shrink-0"
                      />
                      <p className="text-xs font-black text-gray-700">
                        Face Verification Required
                      </p>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                        Verify your identity by matching your live face to the
                        uploaded ID before submitting.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowFaceModal(true)}
                        className="w-full flex items-center justify-center gap-2.5 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-xl font-black text-xs transition-all shadow-md shadow-emerald-200"
                      >
                        <ScanFace size={15} /> Start Face Scan
                      </button>
                    </div>
                  </div>
                )}

                {/* Face verified badge */}
                {previewUrl && faceVerified && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <ScanFace size={16} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-emerald-800">
                        Face Verified
                      </p>
                      <p className="text-[10px] text-emerald-600">
                        Your face matches the submitted ID.
                      </p>
                    </div>
                    <CheckCircle2
                      size={18}
                      className="text-emerald-500 shrink-0"
                    />
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={handleResubmit}
                  disabled={loading || !file || !faceVerified}
                  className="w-full py-3 text-white rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(135deg, #34d399 0%, #059669 100%)",
                    boxShadow:
                      file && faceVerified && !loading
                        ? "0 6px 16px -2px rgba(16,185,129,0.35)"
                        : "none",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={15} /> Uploading…
                    </>
                  ) : (
                    <>
                      <UploadCloud size={15} /> Upload New ID
                    </>
                  )}
                </button>

                {error && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
                    <XCircle
                      size={14}
                      className="text-red-400 shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-red-600 font-semibold leading-relaxed">
                      {error}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-2.5">
          <button
            onClick={() => navigate("/")}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-3 px-4 rounded-xl font-black text-xs hover:bg-gray-800 transition-colors cursor-pointer shadow-lg shadow-gray-900/10"
          >
            <ArrowLeft size={13} /> Back to Login
          </button>
          <a
            href="mailto:support@barangaybonbon.gov.ph"
            className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-600 py-3 px-4 rounded-xl font-black text-xs border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Mail size={13} /> Contact Support
          </a>
        </div>

        <p className="text-[10px] text-gray-400 text-center pb-2">
          © 2026 Barangay Bonbon Document Request System
        </p>
      </div>

      {/* Face Scanner Modal */}
      {showFaceModal && (
        <FaceScanner
          idImageSrc={previewUrl}
          onVerified={() => {
            setFaceVerified(true);
            setShowFaceModal(false);
          }}
          onReset={handleRemoveFile}
          onClose={() => setShowFaceModal(false)}
        />
      )}
    </div>
  );
};

export default RejectedPage;
