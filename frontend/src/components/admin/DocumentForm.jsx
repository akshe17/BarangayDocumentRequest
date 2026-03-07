import React, { useState, useEffect } from "react";
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
  ShieldCheck,
  UserCog,
  Users,
  Info,
} from "lucide-react";

const getFileStyle = (filename) => {
  if (!filename)
    return { Icon: File, accent: "#475569", bg: "#f8fafc", badge: "FILE" };
  const ext = filename.split(".").pop().toLowerCase();
  if (ext === "pdf")
    return { Icon: FileText, accent: "#059669", bg: "#ecfdf5", badge: "PDF" };
  if (ext === "doc" || ext === "docx")
    return { Icon: FileType, accent: "#2563eb", bg: "#eff6ff", badge: "DOC" };
  return {
    Icon: File,
    accent: "#475569",
    bg: "#f8fafc",
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
  handlerRoleId,
  setHandlerRoleId,
  documentFile,
  existingFilePath,
  displayFileName,
  fileInputRef,
  handleFileChange,
  handleRemoveFile,
  onOpenFile,
  requirements = [],
  addReq,
  removeReq,
  updateReq,
  fields = [],
  addField,
  removeField,
  updateField,
  saving,
  formError,
  handleSave,
  onBack,
}) => {
  const { Icon: FileIcon, accent, bg, badge } = getFileStyle(displayFileName);
  const toSelectStr = (val) =>
    val === null || val === undefined || val === "" ? "" : String(val);
  const [selectValue, setSelectValue] = useState(() =>
    toSelectStr(handlerRoleId),
  );

  useEffect(() => {
    setSelectValue(toSelectStr(handlerRoleId));
  }, [handlerRoleId]);

  return (
    <div className="min-h-screen bg-gray-300">
      {" "}
      {/* Darker background for better contrast with cards */}
      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            disabled={saving}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="text-center">
            <h1 className="text-base font-bold text-slate-900">
              {selectedDoc ? `Edit Template` : "Create New Template"}
            </h1>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {selectedDoc
                ? selectedDoc.document_name
                : "Document Configuration"}
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-sm font-bold px-4 py-2 rounded-lg transition-all shadow-md"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span className="hidden sm:inline">
              {selectedDoc ? "Update" : "Save"}
            </span>
          </button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {formError && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl shadow-sm">
            <AlertCircle size={18} className="shrink-0" />
            <p className="text-sm font-semibold">{formError}</p>
          </div>
        )}

        {/* ── Main Layout Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section: Core Information */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Info size={16} className="text-emerald-600" /> General
                  Details
                </h3>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Document Name
                  </label>
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="e.g. Barangay Clearance"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Fee (PHP)
                  </label>
                  <input
                    type="number"
                    value={docFee}
                    onChange={(e) => setDocFee(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section: Requirements */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ListChecks size={16} className="text-emerald-600" /> Entry
                  Requirements
                </h3>
                <button
                  onClick={addReq}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <Plus size={14} /> Add New
                </button>
              </div>
              <div className="p-5 space-y-3">
                {requirements.length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    No requirements added yet.
                  </p>
                )}
                {requirements.map((req, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl relative group"
                  >
                    <div className="flex-1 space-y-3">
                      <input
                        value={req.requirement_name}
                        onChange={(e) =>
                          updateReq(i, "requirement_name", e.target.value)
                        }
                        placeholder="Requirement Title"
                        className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
                      />
                      <textarea
                        value={req.description}
                        onChange={(e) =>
                          updateReq(i, "description", e.target.value)
                        }
                        placeholder="Description (Optional)"
                        rows={1}
                        className="w-full bg-transparent text-xs text-slate-600 outline-none resize-none border-b border-transparent focus:border-slate-300"
                      />
                    </div>
                    <button
                      onClick={() => removeReq(i)}
                      className="text-slate-300 hover:text-red-500 self-start p-1 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Custom Fields */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Settings size={16} className="text-emerald-600" /> Additional
                  Form Fields
                </h3>
                <button
                  onClick={addField}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <Plus size={14} /> Add Field
                </button>
              </div>
              <div className="p-5 space-y-3">
                {fields.map((field, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm items-center"
                  >
                    <div className="col-span-12 sm:col-span-6">
                      <input
                        value={field.field_label}
                        onChange={(e) =>
                          updateField(i, "field_label", e.target.value)
                        }
                        placeholder="Label"
                        className="w-full text-sm font-bold text-slate-800 border-b-2 border-slate-100 focus:border-emerald-500 outline-none pb-1"
                      />
                    </div>
                    <div className="col-span-7 sm:col-span-4">
                      <select
                        value={field.field_type}
                        onChange={(e) =>
                          updateField(i, "field_type", e.target.value)
                        }
                        className="w-full text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-md p-1.5 outline-none"
                      >
                        <option value="text">Short Text</option>
                        <option value="textarea">Long Text</option>
                        <option value="date">Date</option>
                        <option value="number">Number</option>
                      </select>
                    </div>
                    <div className="col-span-5 sm:col-span-2 flex justify-end gap-3">
                      <input
                        type="checkbox"
                        checked={field.is_required}
                        onChange={(e) =>
                          updateField(i, "is_required", e.target.checked)
                        }
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <button
                        onClick={() => removeField(i)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Settings & File */}
          <div className="space-y-6">
            {/* Handler Assignment */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                Handler Settings
              </h3>

              <div className="space-y-3">
                <div className="relative">
                  <select
                    value={selectValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectValue(val);
                      setHandlerRoleId(val === "" ? "" : Number(val));
                    }}
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">— Unassigned —</option>
                    <option value="3">Clerk</option>
                    <option value="4">Zone Leader</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Users size={16} />
                  </div>
                </div>

                {selectValue === "4" ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] font-bold text-blue-700 flex gap-2">
                    <Info size={14} className="shrink-0" />
                    <span>Zone-based processing enabled.</span>
                  </div>
                ) : (
                  selectValue === "" && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] font-bold text-amber-700 flex gap-2">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>No one is processing this document.</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Template Upload */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                File Template
              </h3>
              <input
                ref={fileInputRef}
                type="file"
                id="template-upload"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />

              {displayFileName ? (
                <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center gap-3">
                  <FileIcon size={32} style={{ color: accent }} />
                  <p className="text-xs font-bold text-slate-800 truncate w-full text-center">
                    {displayFileName}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <label
                      htmlFor="template-upload"
                      className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-emerald-600 cursor-pointer shadow-sm"
                    >
                      <RefreshCw size={14} />
                    </label>
                    <button
                      onClick={handleRemoveFile}
                      className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-500 shadow-sm"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="template-upload"
                  className="flex flex-col items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 group transition-all"
                >
                  <Upload
                    size={24}
                    className="text-slate-400 group-hover:text-emerald-500 mb-2"
                  />
                  <span className="text-[11px] font-bold text-slate-500 group-hover:text-emerald-600 uppercase">
                    Upload Template
                  </span>
                </label>
              )}
            </div>

            {/* Auto-Fields (Fixed) */}
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Lock size={14} /> System Fields
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Full Name",
                  "Birthdate",
                  "Gender",
                  "Address",
                  "Civil Status",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentForm;
