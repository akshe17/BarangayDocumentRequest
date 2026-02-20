import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  FileText,
  ListChecks,
  Settings,
  X,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Power,
  Search,
  Loader2,
  AlertCircle,
  Upload,
  Paperclip,
} from "lucide-react";
import api from "../axious/api";
const ICONS = [FileText, Sparkles, FileText, Sparkles];

const Documents = () => {
  // ── View ─────────────────────────────────────────────────────────────────
  const [view, setView] = useState("list");
  const [selectedDoc, setSelectedDoc] = useState(null);

  // ── List ─────────────────────────────────────────────────────────────────
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // ── Form ─────────────────────────────────────────────────────────────────
  const [docName, setDocName] = useState("");
  const [docFee, setDocFee] = useState("");
  const [docStatus, setDocStatus] = useState(true);
  const [documentFile, setDocumentFile] = useState(null); // new File object
  const [existingFilePath, setExistingFilePath] = useState(""); // path from DB
  const [removeFile, setRemoveFile] = useState(false); // signal to backend
  const [requirements, setRequirements] = useState([
    { requirement_name: "", description: "" },
  ]);
  const [fields, setFields] = useState([
    { field_label: "", field_type: "text", is_required: true },
  ]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const fileInputRef = useRef(null);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3500,
    );
  };

  // ── Reset form ────────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setSelectedDoc(null);
    setDocName("");
    setDocFee("");
    setDocStatus(true);
    setDocumentFile(null);
    setExistingFilePath("");
    setRemoveFile(false);
    setRequirements([{ requirement_name: "", description: "" }]);
    setFields([{ field_label: "", field_type: "text", is_required: true }]);
    setFormError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // ── GET /api/document-types ───────────────────────────────────────────────
  const fetchDocumentTypes = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const { data } = await api.get("/document-types");
      setDocumentTypes(Array.isArray(data) ? data : (data.data ?? []));
    } catch (err) {
      setListError(
        err.response?.data?.message || err.message || "Failed to load.",
      );
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchDocumentTypes();
  }, [fetchDocumentTypes]);

  // ── Open edit form ────────────────────────────────────────────────────────
  const handleEditDoc = (doc) => {
    setSelectedDoc(doc);
    setDocName(doc.document_name);
    setDocFee(doc.fee);
    setDocStatus(!!doc.in_use);
    setDocumentFile(null);
    setExistingFilePath(doc.template_path ?? "");
    setRemoveFile(false);
    setRequirements(
      doc.requirements?.length
        ? doc.requirements.map((r) => ({
            requirement_id: r.requirement_id,
            requirement_name: r.requirement_name,
            description: r.description ?? "",
          }))
        : [{ requirement_name: "", description: "" }],
    );
    setFields(
      doc.form_fields?.length
        ? doc.form_fields.map((f) => ({
            field_id: f.field_id,
            field_label: f.field_label,
            field_type: f.field_type,
            is_required: !!f.is_required,
          }))
        : [{ field_label: "", field_type: "text", is_required: true }],
    );
    setFormError(null);
    setView("add");
  };

  // ── File helpers ──────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFile(file);
      setRemoveFile(false);
    }
  };

  const handleRemoveFile = () => {
    setDocumentFile(null);
    setExistingFilePath("");
    setRemoveFile(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Display name shown in the upload box
  const displayFileName = documentFile
    ? documentFile.name
    : existingFilePath
      ? existingFilePath.split("/").pop()
      : null;

  // ── POST / PUT with multipart/form-data ───────────────────────────────────
  const handleSave = async () => {
    if (!docName.trim()) {
      setFormError("Document name is required.");
      return;
    }
    setSaving(true);
    setFormError(null);

    // Build FormData so we can attach the file
    const formData = new FormData();
    formData.append("document_name", docName.trim());
    formData.append("fee", parseFloat(docFee) || 0);
    formData.append("in_use", docStatus ? 1 : 0);

    // File handling
    if (documentFile) {
      formData.append("template_file", documentFile);
    }
    if (removeFile) {
      formData.append("remove_template", 1);
    }

    // Nested arrays — append each item individually for Laravel to parse
    const reqs = requirements.filter((r) => r.requirement_name.trim());
    reqs.forEach((r, i) => {
      if (r.requirement_id)
        formData.append(`requirements[${i}][requirement_id]`, r.requirement_id);
      formData.append(
        `requirements[${i}][requirement_name]`,
        r.requirement_name.trim(),
      );
      formData.append(
        `requirements[${i}][description]`,
        (r.description ?? "").trim(),
      );
    });

    const flds = fields.filter((f) => f.field_label.trim());
    flds.forEach((f, i) => {
      if (f.field_id)
        formData.append(`form_fields[${i}][field_id]`, f.field_id);
      formData.append(`form_fields[${i}][field_label]`, f.field_label.trim());
      formData.append(`form_fields[${i}][field_type]`, f.field_type);
      formData.append(`form_fields[${i}][is_required]`, f.is_required ? 1 : 0);
    });

    try {
      const config = {
        headers: { "Content-Type": "multipart/form-data" },
      };

      if (selectedDoc) {
        // Always POST for updates — route registered as both POST and PUT
        // so multipart/form-data works correctly (PUT + multipart is unreliable)
        await api.post(
          `/document-types/${selectedDoc.document_id}`,
          formData,
          config,
        );
        showToast("Template updated successfully.");
      } else {
        await api.post("/document-types", formData, config);
        showToast("Template created successfully.");
      }

      await fetchDocumentTypes();
      setView("list");
      resetForm();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors ||
        err.message ||
        "Something went wrong.";
      setFormError(typeof msg === "object" ? JSON.stringify(msg) : msg);
    } finally {
      setSaving(false);
    }
  };

  // ── PATCH /api/document-types/{id}  (quick toggle) ───────────────────────
  const handleToggleStatus = async (e, doc) => {
    e.stopPropagation();
    const newVal = doc.in_use ? 0 : 1;
    setDocumentTypes((prev) =>
      prev.map((d) =>
        d.document_id === doc.document_id ? { ...d, in_use: newVal } : d,
      ),
    );
    try {
      await api.patch(`/document-types/${doc.document_id}`, { in_use: newVal });
    } catch (err) {
      setDocumentTypes((prev) =>
        prev.map((d) =>
          d.document_id === doc.document_id ? { ...d, in_use: doc.in_use } : d,
        ),
      );
      showToast(
        err.response?.data?.message || "Failed to update status.",
        "error",
      );
    }
  };

  // ── Mutators ──────────────────────────────────────────────────────────────
  const addReq = () =>
    setRequirements((p) => [...p, { requirement_name: "", description: "" }]);
  const removeReq = (i) =>
    setRequirements((p) => p.filter((_, idx) => idx !== i));
  const updateReq = (i, k, v) =>
    setRequirements((p) => {
      const n = [...p];
      n[i] = { ...n[i], [k]: v };
      return n;
    });

  const addField = () =>
    setFields((p) => [
      ...p,
      { field_label: "", field_type: "text", is_required: true },
    ]);
  const removeField = (i) => setFields((p) => p.filter((_, idx) => idx !== i));
  const updateField = (i, k, v) =>
    setFields((p) => {
      const n = [...p];
      n[i] = { ...n[i], [k]: v };
      return n;
    });

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filteredDocs = documentTypes.filter((doc) => {
    const matchSearch = doc.document_name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "active" && doc.in_use) ||
      (filter === "inactive" && !doc.in_use);
    return matchSearch && matchFilter;
  });

  // ════════════════════════════════════════════════════════════════════════════
  // ADD / EDIT VIEW
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "add") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Sticky nav */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between relative">
            {/* Back */}
            <button
              onClick={() => {
                setView("list");
                resetForm();
              }}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all disabled:opacity-50 shrink-0"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* Title */}
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

            {/* Save */}
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

          {/* Basic Info + File Upload */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Basic Info
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Document name */}
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

              {/* Fee */}
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

            {/* File upload — full width */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">
                Document Template{" "}
                <span className="text-gray-300 font-normal">
                  (Optional — PDF or DOC/DOCX)
                </span>
              </label>

              {/* Hidden real file input */}
              <input
                ref={fileInputRef}
                type="file"
                id="template-upload"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="hidden"
              />

              {displayFileName ? (
                /* File selected / existing file */
                <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <Paperclip
                      size={15}
                      className="text-emerald-500 shrink-0"
                    />
                    <span className="text-sm text-emerald-700 font-medium truncate">
                      {displayFileName}
                    </span>
                    {existingFilePath && !documentFile && (
                      <span className="text-[10px] text-emerald-500 bg-emerald-100 px-1.5 py-0.5 rounded-md font-semibold shrink-0">
                        Saved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {/* Replace */}
                    <label
                      htmlFor="template-upload"
                      className="text-xs font-semibold text-gray-400 hover:text-emerald-600 cursor-pointer transition-colors"
                    >
                      Replace
                    </label>
                    {/* Remove */}
                    <button
                      onClick={handleRemoveFile}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty upload zone */
                <label
                  htmlFor="template-upload"
                  className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/40 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-emerald-500 group-hover:border-emerald-200 transition-all shrink-0">
                    <Upload size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 group-hover:text-emerald-600 transition-colors">
                      Click to upload template
                    </p>
                    <p className="text-xs text-gray-400">
                      PDF, DOC, or DOCX • max 10 MB
                    </p>
                  </div>
                </label>
              )}
            </div>
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
                    onChange={(e) =>
                      updateReq(i, "description", e.target.value)
                    }
                    placeholder="Additional instructions for residents..."
                    rows={2}
                    className="w-full bg-transparent text-xs text-gray-500 placeholder:text-gray-400 focus:outline-none resize-none"
                  />
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
                <p className="text-sm font-semibold text-gray-700">
                  Digital Form Fields
                </p>
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
                  No form fields added yet.
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
                      className="text-gray-300 hover:text-red-400 transition-colors p-1"
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
  }

  // ════════════════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2.5 text-white text-sm font-medium px-4 sm:px-5 py-3 rounded-2xl shadow-lg ${
            toast.type === "error" ? "bg-red-600" : "bg-gray-900"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={16} className="text-red-300 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          )}
          <span className="max-w-xs">{toast.message}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-start sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Document Types
            </h1>
            <p className="text-sm text-gray-400 mt-1 hidden sm:block">
              Configure requirements and fees for barangay services.
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setView("add");
            }}
            className="flex items-center gap-1.5 sm:gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-colors shadow-sm shrink-0"
          >
            <Plus size={17} />
            <span className="hidden sm:inline">New Template</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row bg-white rounded-xl shadow-sm border border-gray-100 p-3 gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 self-stretch sm:self-auto">
            {[
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "inactive", label: "Inactive" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex-1 sm:flex-none px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === key
                    ? key === "inactive"
                      ? "bg-red-50 text-red-500"
                      : key === "active"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-white text-gray-700 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loadingList && (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading document types…</span>
          </div>
        )}

        {/* Error */}
        {listError && !loadingList && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
              <AlertCircle size={20} className="text-red-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              Failed to load documents
            </p>
            <p className="text-xs text-gray-400 max-w-xs">{listError}</p>
            <button
              onClick={fetchDocumentTypes}
              className="mt-1 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Cards */}
        {!loadingList && !listError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredDocs.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <FileText size={20} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-400">
                  No documents found
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  Try adjusting your search or filter
                </p>
              </div>
            )}

            {filteredDocs.map((doc, idx) => {
              const Icon = ICONS[idx % ICONS.length];
              const isActive = !!doc.in_use;
              const reqCount = doc.requirements?.length ?? 0;
              const fieldCount = doc.form_fields?.length ?? 0;
              const hasFile = !!doc.template_path;

              return (
                <div
                  key={doc.document_id}
                  onClick={() => handleEditDoc(doc)}
                  className="group bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-5 sm:mb-6">
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        isActive
                          ? "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Icon size={19} />
                    </div>
                    <button
                      onClick={(e) => handleToggleStatus(e, doc)}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-all hover:opacity-75 active:scale-95 ${
                        isActive
                          ? "text-emerald-600 bg-emerald-50"
                          : "text-red-400 bg-red-50"
                      }`}
                    >
                      {isActive ? "Active" : "Inactive"}
                    </button>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 leading-snug">
                    {doc.document_name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Fee: ₱ {parseFloat(doc.fee || 0).toFixed(2)}
                  </p>

                  <div className="mt-5 sm:mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex gap-4 sm:gap-5">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-300">
                          Requirements
                        </p>
                        <p className="text-sm font-medium text-gray-600 mt-0.5">
                          {reqCount} {reqCount === 1 ? "item" : "items"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-300">
                          Form Fields
                        </p>
                        <p className="text-sm font-medium text-gray-600 mt-0.5">
                          {fieldCount} {fieldCount === 1 ? "field" : "fields"}
                        </p>
                      </div>
                      {hasFile && (
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-300">
                            Template
                          </p>
                          <p className="text-sm font-medium text-emerald-500 mt-0.5 flex items-center gap-1">
                            <Paperclip size={11} /> Attached
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all">
                      <ChevronRight size={17} />
                    </div>
                  </div>
                </div>
              );
            })}

            {filter === "all" && !search && (
              <button
                onClick={() => {
                  resetForm();
                  setView("add");
                }}
                className="group border-2 border-dashed border-gray-200 rounded-2xl p-5 sm:p-6 min-h-[180px] sm:min-h-[220px] flex flex-col items-center justify-center gap-3 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-300 group-hover:border-emerald-400 group-hover:text-emerald-500 transition-all">
                  <Plus size={20} />
                </div>
                <span className="text-sm font-medium text-gray-400 group-hover:text-emerald-600 transition-colors">
                  Add Document Type
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;
