import React, { useState } from "react";
import {
  XCircle,
  ArrowLeft,
  Mail,
  UploadCloud,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
// Assuming you have a configured axios instance
import api from "../../axious/api";

// --- UPDATE: Receive userId as a prop ---
const RejectedPage = ({ userId }) => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // STATE FOR PREVIEW
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleBackToLogin = () => {
    navigate("/");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
      setMessage("");

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleResubmit = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    // --- SECURITY CHECK ---
    if (!userId) {
      setError("User ID missing. Please login again.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    const formData = new FormData();
    formData.append("id_image", file);
    // --- CHANGE: Append the user_id ---
    formData.append("user_id", userId);
    // Needed to spoof PUT request in Laravel for file uploads
    formData.append("_method", "PUT");

    try {
      // NOTE: This endpoint should NOT require auth:sanctum
      await api.post("/resident/resubmit-id", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage(
        "New ID uploaded successfully! Your account is now pending review.",
      );
      setFile(null); // Clear input
      setPreviewUrl(null); // Clear preview
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to upload ID. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl max-w-lg w-full text-center">
        {/* Title & Message */}
        <h2 className="text-2xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Account Request Rejected
        </h2>
        <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-8 border-4 border-red-100 shadow-inner">
          <XCircle className="w-6 h-6 text-red-500" />
        </div>

        <p className="text-gray-600 mb-8 leading-relaxed text-sm">
          We regret to inform you that your registration request was reviewed
          and
          <span className="font-semibold text-red-600"> not approved</span> by
          the Barangay administrator.
        </p>

        {/* --- RESUBMIT SECTION --- */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 text-left">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <UploadCloud size={18} className="text-emerald-600" />
            Resubmit Valid ID for Re-evaluation
          </h3>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 mb-4"
          />

          {/* IMAGE PREVIEW AREA */}
          {previewUrl && (
            <div className="mb-4 p-2 border-2 border-dashed border-gray-300 rounded-xl">
              <img
                src={previewUrl}
                alt="ID Preview"
                className="max-h-48 rounded-lg mx-auto object-contain"
              />
            </div>
          )}

          <button
            onClick={handleResubmit}
            disabled={loading || !file}
            className={`${loading || !file ? "cursor-not-allowed" : "cursor-pointer"} w-full bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:bg-emerald-700 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Uploading...
              </>
            ) : (
              "Upload New ID"
            )}
          </button>

          {message && (
            <div className="text-emerald-700 text-xs mt-4 font-medium flex items-center gap-2 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <CheckCircle2 size={16} />
              {message}
            </div>
          )}
          {error && (
            <p className="text-red-600 text-xs mt-4 font-medium text-center bg-red-50 p-3 rounded-xl border border-red-200">
              {error}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleBackToLogin}
            className="flex items-center cursor-pointer text-sm justify-center gap-2 bg-gray-900 text-white py-4 px-8 rounded-2xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 "
          >
            <ArrowLeft size={20} />
            Back to Login
          </button>
          <a
            href="mailto:support@barangaybonbon.gov.ph"
            className="flex items-center justify-center text-sm gap-2 bg-white text-gray-800 py-4 px-8 rounded-2xl font-bold border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors "
          >
            <Mail size={20} />
            Contact Support
          </a>
        </div>
      </div>

      {/* Footer text */}
      <p className="text-sm text-gray-500 mt-10">
        © 2026 Barangay Bonbon Document Request System
      </p>
    </div>
  );
};

export default RejectedPage;
