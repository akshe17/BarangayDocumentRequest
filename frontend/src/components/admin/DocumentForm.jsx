import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  ListChecks,
  Settings,
  X,
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
  Users,
  Info,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   FILE STYLE HELPER
───────────────────────────────────────────────────────────── */
const getFileStyle = (filename) => {
  if (!filename)
    return { Icon: File, accent: "#64748b", bg: "#f8fafc", badge: "FILE" };
  const ext = filename.split(".").pop().toLowerCase();
  if (ext === "pdf")
    return { Icon: FileText, accent: "#059669", bg: "#ecfdf5", badge: "PDF" };
  if (ext === "doc" || ext === "docx")
    return { Icon: FileType, accent: "#2563eb", bg: "#eff6ff", badge: "DOC" };
  return {
    Icon: File,
    accent: "#64748b",
    bg: "#f8fafc",
    badge: ext.toUpperCase(),
  };
};

/* ─────────────────────────────────────────────────────────────
   SECTION CARD WRAPPER
───────────────────────────────────────────────────────────── */
const SectionCard = ({ icon: Icon, title, action, children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
    <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2">
        {Icon && <Icon size={13} className="text-emerald-500" />}
        {title}
      </h3>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   INPUT + LABEL
───────────────────────────────────────────────────────────── */
const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium " +
  "focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:bg-white outline-none transition-all placeholder-slate-400";

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
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
  const { Icon: FileIcon, accent } = getFileStyle(displayFileName);

  const toSelectStr = (val) =>
    val === null || val === undefined || val === "" ? "" : String(val);
  const [selectValue, setSelectValue] = useState(() =>
    toSelectStr(handlerRoleId),
  );

  useEffect(() => {
    setSelectValue(toSelectStr(handlerRoleId));
  }, [handlerRoleId]);

  return (
    /* ── Page shell — same bg-slate-50 as Archived Users ── */
    <div className="min-h-screen bg-slate-50">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          {/* Back */}
          <button
            onClick={onBack}
            disabled={saving}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors group disabled:opacity-50"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Title */}
          <div className="text-center flex-1 min-w-0">
            <h1 className="text-base font-black text-slate-900 leading-none">
              {selectedDoc ? "Edit Template" : "Create New Template"}
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5 truncate">
              {selectedDoc
                ? selectedDoc.document_name
                : "Document Configuration"}
            </p>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300
                       text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            <span className="hidden sm:inline">
              {selectedDoc ? "Update" : "Save"}
            </span>
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7">
        {/* Error banner */}
        {formError && (
          <div className="mb-6 flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-semibold">
            <AlertCircle size={15} className="shrink-0" />
            {formError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── LEFT: 2/3 width ─────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* General Details */}
            <SectionCard icon={Info} title="General Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Document Name">
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="e.g. Barangay Clearance"
                    className={inputCls}
                  />
                </Field>
                <Field label="Fee (PHP)">
                  <input
                    type="number"
                    value={docFee}
                    onChange={(e) => setDocFee(e.target.value)}
                    placeholder="0.00"
                    className={inputCls}
                  />
                </Field>
              </div>
            </SectionCard>

            {/* Requirements */}
            <SectionCard
              icon={ListChecks}
              title="Entry Requirements"
              action={
                <button
                  onClick={addReq}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <Plus size={12} /> Add
                </button>
              }
            >
              <div className="space-y-3">
                {requirements.length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    No requirements added yet.
                  </p>
                )}
                {requirements.map((req, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl"
                  >
                    <div className="flex-1 space-y-2">
                      <input
                        value={req.requirement_name}
                        onChange={(e) =>
                          updateReq(i, "requirement_name", e.target.value)
                        }
                        placeholder="Requirement title"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                      />
                      <textarea
                        value={req.description}
                        onChange={(e) =>
                          updateReq(i, "description", e.target.value)
                        }
                        placeholder="Description (optional)"
                        rows={1}
                        className="w-full bg-transparent text-xs text-slate-500 outline-none resize-none border-b border-transparent focus:border-slate-200 transition-all"
                      />
                    </div>
                    <button
                      onClick={() => removeReq(i)}
                      className="text-slate-300 hover:text-rose-500 self-start p-1 transition-colors mt-0.5"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Custom Fields */}
            <SectionCard
              icon={Settings}
              title="Additional Form Fields"
              action={
                <button
                  onClick={addField}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <Plus size={12} /> Add Field
                </button>
              }
            >
              <div className="space-y-3">
                {fields.length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    No custom fields added yet.
                  </p>
                )}
                {fields.map((field, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl items-center"
                  >
                    <div className="col-span-12 sm:col-span-6">
                      <input
                        value={field.field_label}
                        onChange={(e) =>
                          updateField(i, "field_label", e.target.value)
                        }
                        placeholder="Field label"
                        className="w-full text-sm font-bold text-slate-800 bg-transparent border-b-2 border-slate-200 focus:border-emerald-400 outline-none pb-1 transition-colors"
                      />
                    </div>
                    <div className="col-span-7 sm:col-span-4">
                      <select
                        value={field.field_type}
                        onChange={(e) =>
                          updateField(i, "field_type", e.target.value)
                        }
                        className="w-full text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg p-1.5 outline-none focus:border-emerald-400 transition-colors"
                      >
                        <option value="text">Short Text</option>
                        <option value="textarea">Long Text</option>
                        <option value="date">Date</option>
                        <option value="number">Number</option>
                      </select>
                    </div>
                    <div className="col-span-5 sm:col-span-2 flex items-center justify-end gap-3">
                      <input
                        type="checkbox"
                        checked={field.is_required}
                        onChange={(e) =>
                          updateField(i, "is_required", e.target.checked)
                        }
                        className="w-4 h-4 accent-emerald-500 cursor-pointer"
                        title="Required"
                      />
                      <button
                        onClick={() => removeField(i)}
                        className="text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* ─── RIGHT: 1/3 width ────────────────────────────── */}
          <div className="space-y-5">
            {/* Handler Assignment */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2">
                  <Users size={13} className="text-emerald-500" /> Handler
                </h3>
              </div>
              <div className="p-5 space-y-3">
                <div className="relative">
                  <select
                    value={selectValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectValue(val);
                      setHandlerRoleId(val === "" ? "" : Number(val));
                    }}
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-200  text-slate-900 rounded-xl text-sm font-bold
                               appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="">— Unassigned —</option>
                    <option value="3">Clerk</option>
                    <option value="4">Zone Leader</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Users size={14} className="text-slate-400" />
                  </div>
                </div>

                {selectValue === "4" && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] font-bold text-blue-700">
                    <Info size={13} className="shrink-0 mt-0.5" />
                    Zone-based processing enabled.
                  </div>
                )}
                {selectValue === "" && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] font-bold text-amber-700">
                    <AlertCircle size={13} className="shrink-0 mt-0.5" />
                    No one is processing this document.
                  </div>
                )}
              </div>
            </div>

            {/* File Template */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
                  File Template
                </h3>
              </div>
              <div className="p-5">
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
                    <FileIcon size={30} style={{ color: accent }} />
                    <p className="text-xs font-bold text-slate-700 truncate w-full text-center">
                      {displayFileName}
                    </p>
                    <div className="flex gap-2">
                      {existingFilePath && (
                        <button
                          onClick={() =>
                            onOpenFile?.({ template_path: existingFilePath })
                          }
                          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-emerald-600 transition-colors"
                          title="Open file"
                        >
                          <ExternalLink size={13} />
                        </button>
                      )}
                      <label
                        htmlFor="template-upload"
                        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-emerald-600 cursor-pointer transition-colors"
                        title="Replace file"
                      >
                        <RefreshCw size={13} />
                      </label>
                      <button
                        onClick={handleRemoveFile}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                        title="Remove file"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="template-upload"
                    className="flex flex-col items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-200
                               rounded-xl cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 group transition-all"
                  >
                    <Upload
                      size={22}
                      className="text-slate-300 group-hover:text-emerald-500 mb-2 transition-colors"
                    />
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-emerald-600 uppercase tracking-widest transition-colors">
                      Upload Template
                    </span>
                    <span className="text-[10px] text-slate-300 mt-1">
                      PDF, DOC, DOCX
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* System Fields (read-only) */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2">
                  <Lock size={11} className="text-slate-400" /> System Fields
                </h3>
              </div>
              <div className="p-5">
                <p className="text-[10px] text-slate-400 mb-3">
                  Auto-populated from resident profile
                </p>
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
                      className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full border border-slate-200"
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
    </div>
  );
};

export default DocumentForm;
