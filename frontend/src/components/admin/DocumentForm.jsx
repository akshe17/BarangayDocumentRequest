import React from "react";
import {
  ArrowLeft,
  Save,
  ListChecks,
  Settings,
  X,
  Power,
  Loader2,
  AlertCircle,
  Upload,
  Trash2,
  ExternalLink,
  FileText,
  FileType,
  File,
  RefreshCw,
  Lock,
  Plus,
} from "lucide-react";

// Picks icon + accent color based on file extension
const getFileStyle = (filename) => {
  if (!filename)
    return { Icon: File, accent: "#6b7280", bg: "#f9fafb", badge: "FILE" };
  const ext = filename.split(".").pop().toLowerCase();
  if (ext === "pdf")
    return { Icon: FileText, accent: "#10b981", bg: "#eff6ff", badge: "PDF" };
  if (ext === "doc" || ext === "docx")
    return {
      Icon: FileType,
      accent: "#10b981",
      bg: "#eff6ff",
      badge: ext.toUpperCase(),
    };
  return {
    Icon: File,
    accent: "#6b7280",
    bg: "#f9fafb",
    badge: ext.toUpperCase(),
  };
};

const DocumentForm = ({
  selectedDoc,
  docName,
  setDocName,
  docFee,
  setDocFee,
  docStatus,
  setDocStatus,
  documentFile,
  existingFilePath,
  displayFileName,
  fileInputRef,
  handleFileChange,
  handleRemoveFile,
  onOpenFile,
  requirements,
  addReq,
  removeReq,
  updateReq,
  fields,
  addField,
  removeField,
  updateField,
  saving,
  formError,
  handleSave,
  onBack,
}) => {
  const { Icon: FileIcon, accent, bg, badge } = getFileStyle(displayFileName);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky nav */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between relative">
          <button
            onClick={onBack}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all disabled:opacity-50 shrink-0"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none w-full px-28 sm:px-0 sm:w-auto">
            <p className="text-sm font-semibold text-gray-800 leading-tight truncate">
              {selectedDoc
                ? `Edit: ${selectedDoc.document_name}`
                : "New Document Template"}
            </p>
            <p className="text-xs text-gray-400 leading-tight mt-0.5 hidden sm:block">
              {selectedDoc
                ? "Update existing configuration"
                : "Fill in the details below"}
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 sm:gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white text-sm font-medium px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-colors shadow-sm shrink-0"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            <span className="hidden sm:inline">
              {saving
                ? "Saving…"
                : selectedDoc
                  ? "Update Template"
                  : "Save Template"}
            </span>
            <span className="sm:hidden">{saving ? "…" : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-4">
        {/* Error banner */}
        {formError && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* Status toggle (edit only) */}
        {selectedDoc && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Document Status
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Enable or disable this document for residents
              </p>
            </div>
            <button
              onClick={() => setDocStatus((s) => !s)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${
                docStatus
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : "bg-red-50 text-red-500 border border-red-100"
              }`}
            >
              <Power size={14} />
              {docStatus ? "Active" : "Inactive"}
            </button>
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Basic Info
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">
                Document Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="e.g. Barangay Clearance"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">
                Processing Fee (PHP)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={docFee}
                onChange={(e) => setDocFee(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* ── Document Template ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Document Template
            </p>
            <span className="text-[10px] text-gray-300">
              Optional — PDF or DOC/DOCX
            </span>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            id="template-upload"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="hidden"
          />

          {displayFileName ? (
            /* ── File exists: prominent card ── */
            <div
              className="relative rounded-2xl border-2 overflow-hidden transition-all"
              style={{ borderColor: `${accent}33` }}
            >
              {/* Colored accent stripe at top */}
              <div
                className="h-1 w-full"
                style={{
                  background: `linear-gradient(90deg, ${accent}, ${accent}66)`,
                }}
              />

              {/* Card body */}
              <div
                className="flex flex-col items-center justify-center gap-5 px-6 py-8 sm:py-10"
                style={{ background: bg }}
              >
                {/* Big file icon */}
                <div className="relative">
                  {/* Glow */}
                  <div
                    className="absolute inset-0 rounded-3xl scale-110 blur-2xl opacity-20"
                    style={{ background: accent }}
                  />
                  {/* Icon card */}
                  <div
                    className="relative w-24 h-28 sm:w-28 sm:h-32 rounded-2xl bg-white flex flex-col items-center justify-center shadow-md"
                    style={{ border: `1.5px solid ${accent}22` }}
                  >
                    {/* Dog-ear fold */}
                    <div
                      className="absolute top-0 right-0 w-7 h-7 rounded-bl-lg"
                      style={{ background: `${accent}22` }}
                    />
                    <div
                      className="absolute top-0 right-0 w-0 h-0"
                      style={{
                        borderLeft: "28px solid transparent",
                        borderTop: `28px solid ${bg}`,
                      }}
                    />

                    <FileIcon
                      size={40}
                      style={{ color: accent }}
                      strokeWidth={1.4}
                      className="mt-2"
                    />

                    {/* Badge */}
                    <span
                      className="mt-3 text-[9px] font-black tracking-widest px-2 py-0.5 rounded text-white"
                      style={{ background: accent }}
                    >
                      {badge}
                    </span>
                  </div>
                </div>

                {/* Filename */}
                <div className="text-center">
                  <p
                    className="text-sm sm:text-base font-semibold truncate max-w-[260px]"
                    style={{ color: accent }}
                  >
                    {displayFileName}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {existingFilePath && !documentFile
                      ? "Saved template file"
                      : "Ready to upload"}
                  </p>
                </div>

                {/* Action buttons row */}
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {existingFilePath && !documentFile && (
                    <button
                      onClick={() => onOpenFile(selectedDoc)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
                      style={{ background: accent }}
                    >
                      <ExternalLink size={12} />
                      View Document
                    </button>
                  )}
                  <label
                    htmlFor="template-upload"
                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border cursor-pointer transition-all hover:opacity-80 active:scale-95"
                    style={{
                      color: accent,
                      borderColor: `${accent}44`,
                      background: `${accent}12`,
                    }}
                  >
                    <RefreshCw size={12} />
                    Replace
                  </label>
                  <button
                    onClick={handleRemoveFile}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all active:scale-95"
                    title="Remove file"
                  >
                    <X size={12} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── Empty: upload dropzone ── */
            <label
              htmlFor="template-upload"
              className="flex flex-col items-center justify-center gap-4 px-6 py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-300 group-hover:text-emerald-500 group-hover:border-emerald-200 transition-all">
                <Upload size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-500 group-hover:text-emerald-600 transition-colors">
                  Click to upload template
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  PDF, DOC, or DOCX · max 10 MB
                </p>
              </div>
            </label>
          )}
        </div>

        {/* Entry Requirements */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                <ListChecks size={16} />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                Entry Requirements
              </p>
            </div>
            <button
              onClick={addReq}
              className="text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              + Add
            </button>
          </div>

          <div className="space-y-3">
            {requirements.length === 0 && (
              <p className="text-xs text-gray-300 text-center py-3">
                No requirements added yet.
              </p>
            )}
            {requirements.map((req, i) => (
              <div
                key={i}
                className="group relative p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2.5"
              >
                <button
                  onClick={() => removeReq(i)}
                  className="absolute top-3.5 right-3.5 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                <input
                  value={req.requirement_name}
                  onChange={(e) =>
                    updateReq(i, "requirement_name", e.target.value)
                  }
                  placeholder="Requirement name (e.g. Cedula)"
                  className="w-full bg-transparent border-b border-gray-200 pb-2 pr-7 text-sm font-medium text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400 transition-colors"
                />
                <textarea
                  value={req.description}
                  onChange={(e) => updateReq(i, "description", e.target.value)}
                  placeholder="Additional instructions for residents..."
                  rows={2}
                  className="w-full bg-transparent text-xs text-gray-500 placeholder:text-gray-400 focus:outline-none resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Auto-generated Fields (read-only preview) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
              <Lock size={15} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Auto-generated Fields
              </p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                These fields are automatically pulled from the resident's
                profile. You don't need to add them — they will always be
                included in every request.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { label: "Resident Name", placeholder: "e.g. Juan Dela Cruz" },
              { label: "Birthdate", placeholder: "e.g. October 18, 2004" },
              { label: "Civil Status", placeholder: "e.g. Single" },
              { label: "Gender", placeholder: "e.g. Male" },
              { label: "Reason", placeholder: "e.g. For school Purposes" },
            ].map(({ label, placeholder }) => (
              <div key={label} className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-500 flex items-center gap-1.5">
                  {label}
                  <span className="text-[10px] font-normal text-gray-500 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-md">
                    auto-filled
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={placeholder}
                    readOnly
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-500 cursor-not-allowed select-none italic"
                  />
                  <Lock
                    size={12}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Form Fields */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                <Settings size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Additional Form Fields
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Extra fields residents must fill in when requesting this
                  document
                </p>
              </div>
            </div>
            <button
              onClick={addField}
              className="text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              + Add
            </button>
          </div>

          <div className="space-y-3">
            {fields.length === 0 && (
              <p className="text-xs text-gray-300 text-center py-3">
                No additional fields added yet. The auto-generated fields above
                are always included.
              </p>
            )}
            {fields.map((field, i) => (
              <div
                key={i}
                className="p-4 border border-gray-100 rounded-xl bg-white hover:border-emerald-100 transition-colors space-y-3"
              >
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Label
                    </label>
                    <input
                      value={field.field_label}
                      onChange={(e) =>
                        updateField(i, "field_label", e.target.value)
                      }
                      placeholder="e.g. Purpose"
                      className="w-full bg-transparent border-b border-gray-100 pb-1.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Type
                    </label>
                    <select
                      value={field.field_type}
                      onChange={(e) =>
                        updateField(i, "field_type", e.target.value)
                      }
                      className="w-full bg-transparent border-b border-gray-100 pb-1.5 text-sm text-gray-700 focus:outline-none focus:border-emerald-400 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="text">Short Text</option>
                      <option value="textarea">Long Text</option>
                      <option value="date">Date</option>
                      <option value="number">Number</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.is_required}
                      onChange={(e) =>
                        updateField(i, "is_required", e.target.checked)
                      }
                      className="w-3.5 h-3.5 accent-emerald-500 cursor-pointer"
                    />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Required
                    </span>
                  </label>
                  <button
                    onClick={() => removeField(i)}
                    className="text-gray-600 cursor-pointer hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile bottom save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="sm:hidden w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white text-sm font-medium py-3 rounded-xl transition-colors shadow-sm"
        >
          {saving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          {saving
            ? "Saving…"
            : selectedDoc
              ? "Update Template"
              : "Save Template"}
        </button>
      </div>
    </div>
  );
};

export default DocumentForm;
