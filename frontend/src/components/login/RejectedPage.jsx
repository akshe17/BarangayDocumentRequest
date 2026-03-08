import React, { useState } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../axious/api";

const ALL_IDS = [
  { label: "Philippine National ID (PhilSys)", primary: true },
  { label: "Driver\'s License", primary: true },
  { label: "Philippine Passport", primary: true },
  { label: "Unified Multi-Purpose ID (UMID)", primary: true },
  { label: "SSS ID", primary: true },
  { label: "GSIS eCard", primary: true },
  { label: "Voter\'s ID", primary: true },
  { label: "Postal ID", primary: true },
  { label: "PhilHealth ID", primary: true },
  { label: "TIN ID", primary: true },
  { label: "School ID (current year)", primary: false },
  { label: "Company ID", primary: false },
  { label: "Senior Citizen ID", primary: false },
];

const VISIBLE_BY_DEFAULT = 4;

const RejectedPage = ({ userId }) => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showAllIds, setShowAllIds] = useState(false);

  const visibleIds = showAllIds
    ? ALL_IDS
    : ALL_IDS.slice(0, VISIBLE_BY_DEFAULT);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setError("");
    setMessage("");
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleResubmit = async () => {
    if (!file) {
      setError("Please select a file first.");
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
      setFile(null);
      setPreviewUrl(null);
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
            <label className="group flex flex-col items-center justify-center gap-2 w-full py-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-gray-50 hover:bg-emerald-50/60 hover:border-emerald-300 transition-all">
              <ImageUp
                size={20}
                className="text-gray-300 group-hover:text-emerald-400 transition-colors"
              />
              <p className="text-xs font-bold text-gray-400 group-hover:text-emerald-600 transition-colors">
                {file ? file.name : "Tap to choose a photo"}
              </p>
              <p className="text-[10px] text-gray-300">JPG, PNG · max 10MB</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {previewUrl && (
              <div className="rounded-xl overflow-hidden border border-emerald-100 bg-emerald-50/30 p-2">
                <img
                  src={previewUrl}
                  alt="ID Preview"
                  className="max-h-40 rounded-lg mx-auto object-contain"
                />
              </div>
            )}

            <button
              onClick={handleResubmit}
              disabled={loading || !file}
              className="w-full py-3 text-white rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
                boxShadow:
                  file && !loading
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

            {message && (
              <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-3">
                <CheckCircle2
                  size={14}
                  className="text-emerald-500 shrink-0 mt-0.5"
                />
                <p className="text-xs text-emerald-700 font-semibold leading-relaxed">
                  {message}
                </p>
              </div>
            )}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
                <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 font-semibold leading-relaxed">
                  {error}
                </p>
              </div>
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
    </div>
  );
};

export default RejectedPage;
