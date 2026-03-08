import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  PowerOff,
  Power,
  Trash2,
  X,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import api from "../../axious/api";
import Skeleton from "../../components/Skeleton";
import DocumentToast from "../../components/admin/DocumentToast";
import DocumentList from "../../components/admin/DocumentList";
import DocumentForm from "../../components/admin/DocumentForm";

/* ─────────────────────────────────────────────────────────────
   SKELETON — card grid layout
───────────────────────────────────────────────────────────── */
const DocumentListSkeleton = () => (
  <div className="min-h-screen bg-slate-50">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton.Block className="w-44 h-6" />
          <Skeleton.Block className="w-64 h-3.5" />
        </div>
        <Skeleton.Block className="w-32 h-10 rounded-xl" />
      </div>
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-3 flex gap-3">
        <Skeleton.Block className="flex-1 h-10 rounded-xl" />
        <Skeleton.Block className="w-36 h-10 rounded-xl" />
        <Skeleton.Block className="w-48 h-10 rounded-xl" />
      </div>
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4"
          >
            <div className="flex justify-between">
              <Skeleton.Block className="w-10 h-10 rounded-xl" />
              <Skeleton.Block className="w-16 h-6 rounded-full" />
            </div>
            <Skeleton.Block className="w-3/4 h-4" />
            <Skeleton.Block className="w-1/3 h-3" />
            <div className="pt-3 border-t border-slate-50 flex justify-between items-end">
              <div className="flex gap-4">
                <Skeleton.Block className="w-8 h-8" />
                <Skeleton.Block className="w-8 h-8" />
                <Skeleton.Block className="w-12 h-8" />
              </div>
              <Skeleton.Block className="w-16 h-7 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────────────── */
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold
      ${
        type === "success"
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-rose-50 border-rose-200 text-rose-700"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 size={15} />
      ) : (
        <AlertCircle size={15} />
      )}
      {message}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100">
        <X size={13} />
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   DISABLE / ENABLE MODAL
───────────────────────────────────────────────────────────── */
const DisableModal = ({ doc, onConfirm, onCancel, loading }) => {
  const isActive = !!doc.in_use;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-sm w-full p-6 space-y-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto
          ${isActive ? "bg-amber-50 border border-amber-100" : "bg-emerald-50 border border-emerald-100"}`}
        >
          {isActive ? (
            <PowerOff size={18} className="text-amber-500" />
          ) : (
            <Power size={18} className="text-emerald-500" />
          )}
        </div>

        <div className="text-center space-y-1.5">
          <p className="text-sm font-black text-slate-900">
            {isActive ? "Disable Document?" : "Enable Document?"}
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-700">
              {doc.document_name}
            </span>
            {isActive
              ? " will be hidden from residents. Existing requests are unaffected."
              : " will be made available for residents to request again."}
          </p>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500
                       hover:border-slate-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition-colors
                        disabled:opacity-60 flex items-center justify-center gap-2
                        ${isActive ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-500 hover:bg-emerald-600"}`}
          >
            {loading ? (
              <>
                <RefreshCw size={11} className="animate-spin" /> Working…
              </>
            ) : isActive ? (
              <>
                <PowerOff size={11} /> Disable
              </>
            ) : (
              <>
                <Power size={11} /> Enable
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   DELETE MODAL
   Shows a blocking message (from 409) instead of confirm button
   when the doc has existing requests.
───────────────────────────────────────────────────────────── */
const DeleteModal = ({ doc, onConfirm, onCancel, loading, blockReason }) => (
  <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-sm w-full p-6 space-y-4">
      <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto">
        <Trash2 size={18} className="text-rose-500" />
      </div>

      <div className="text-center space-y-1.5">
        <p className="text-sm font-black text-slate-900">
          Delete Document Type?
        </p>

        {blockReason ? (
          /* Server returned 409 — doc has requests, can't delete */
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-3 text-left mt-1">
            <AlertTriangle
              size={13}
              className="text-amber-500 shrink-0 mt-0.5"
            />
            <p className="text-xs font-semibold text-amber-700 leading-snug">
              {blockReason}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-700">
              {doc.document_name}
            </span>{" "}
            and all its requirements and form fields will be permanently
            removed. This cannot be undone.
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500
                     hover:border-slate-300 transition-colors disabled:opacity-50"
        >
          {blockReason ? "Close" : "Cancel"}
        </button>

        {/* Hide confirm button when blocked */}
        {!blockReason && (
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold
                       transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw size={11} className="animate-spin" /> Deleting…
              </>
            ) : (
              <>
                <Trash2 size={11} /> Delete
              </>
            )}
          </button>
        )}
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const DocumentsManagement = () => {
  // ── View ──────────────────────────────────────────────────
  const [view, setView] = useState("list");
  const [selectedDoc, setSelectedDoc] = useState(null);

  // ── List ──────────────────────────────────────────────────
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [handlerFilter, setHandlerFilter] = useState("all");

  // ── Modals ────────────────────────────────────────────────
  const [disableTarget, setDisableTarget] = useState(null); // doc pending disable/enable
  const [deleteTarget, setDeleteTarget] = useState(null); // doc pending delete
  const [deleteBlockMsg, setDeleteBlockMsg] = useState(null); // 409 message
  const [modalLoading, setModalLoading] = useState(false);

  // ── Toast ─────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => setToast({ message, type });

  // ── Form ──────────────────────────────────────────────────
  const [docName, setDocName] = useState("");
  const [docFee, setDocFee] = useState("");
  const [docStatus, setDocStatus] = useState(true);
  const [handlerRoleId, setHandlerRoleId] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [existingFilePath, setExistingFilePath] = useState("");
  const [removeFile, setRemoveFile] = useState(false);
  const [requirements, setRequirements] = useState([
    { requirement_name: "", description: "" },
  ]);
  const [fields, setFields] = useState([
    { field_label: "", field_type: "text", is_required: true },
  ]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const fileInputRef = useRef(null);

  // ── Reset form ────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setSelectedDoc(null);
    setDocName("");
    setDocFee("");
    setDocStatus(true);
    setHandlerRoleId("");
    setDocumentFile(null);
    setExistingFilePath("");
    setRemoveFile(false);
    setRequirements([{ requirement_name: "", description: "" }]);
    setFields([{ field_label: "", field_type: "text", is_required: true }]);
    setFormError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // ── Fetch ─────────────────────────────────────────────────
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

  // ── Open edit ─────────────────────────────────────────────
  const handleEditDoc = (doc) => {
    setSelectedDoc(doc);
    setDocName(doc.document_name);
    setDocFee(doc.fee);
    setDocStatus(!!doc.in_use);
    setHandlerRoleId(doc.handler_role_id ?? "");
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

  // ── Open file ─────────────────────────────────────────────
  const handleOpenFile = (doc) => {
    const path = doc?.template_path;
    if (!path) return;
    const baseUrl = api.defaults?.baseURL?.replace(/\/api$/, "") ?? "";
    const fileUrl = path.startsWith("http")
      ? path
      : `${baseUrl}/storage/${path}`;
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  // ── File helpers ──────────────────────────────────────────
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
  const displayFileName = documentFile
    ? documentFile.name
    : existingFilePath
      ? existingFilePath.split("/").pop()
      : null;

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!docName.trim()) {
      setFormError("Document name is required.");
      return;
    }
    setSaving(true);
    setFormError(null);

    const formData = new FormData();
    formData.append("document_name", docName.trim());
    formData.append("fee", parseFloat(docFee) || 0);
    formData.append("in_use", docStatus ? 1 : 0);
    formData.append(
      "handler_role_id",
      handlerRoleId !== "" ? handlerRoleId : "",
    );

    if (documentFile) formData.append("template_file", documentFile);
    if (removeFile) formData.append("remove_template", 1);

    requirements
      .filter((r) => r.requirement_name.trim())
      .forEach((r, i) => {
        if (r.requirement_id)
          formData.append(
            `requirements[${i}][requirement_id]`,
            r.requirement_id,
          );
        formData.append(
          `requirements[${i}][requirement_name]`,
          r.requirement_name.trim(),
        );
        formData.append(
          `requirements[${i}][description]`,
          (r.description ?? "").trim(),
        );
      });
    fields
      .filter((f) => f.field_label.trim())
      .forEach((f, i) => {
        if (f.field_id)
          formData.append(`form_fields[${i}][field_id]`, f.field_id);
        formData.append(`form_fields[${i}][field_label]`, f.field_label.trim());
        formData.append(`form_fields[${i}][field_type]`, f.field_type);
        formData.append(
          `form_fields[${i}][is_required]`,
          f.is_required ? 1 : 0,
        );
      });

    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (selectedDoc) {
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

  // ── DISABLE / ENABLE  (PATCH in_use) ─────────────────────
  const handleDisableConfirm = async () => {
    if (!disableTarget) return;
    setModalLoading(true);
    const newVal = disableTarget.in_use ? 0 : 1;
    try {
      await api.patch(`/document-types/${disableTarget.document_id}`, {
        in_use: newVal,
      });
      // Optimistic update
      setDocumentTypes((prev) =>
        prev.map((d) =>
          d.document_id === disableTarget.document_id
            ? { ...d, in_use: newVal }
            : d,
        ),
      );
      showToast(
        newVal
          ? `"${disableTarget.document_name}" has been enabled.`
          : `"${disableTarget.document_name}" has been disabled.`,
      );
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update status.",
        "error",
      );
    } finally {
      setModalLoading(false);
      setDisableTarget(null);
    }
  };

  // ── DELETE ────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setModalLoading(true);
    try {
      await api.delete(`/document-types/${deleteTarget.document_id}`);
      setDocumentTypes((prev) =>
        prev.filter((d) => d.document_id !== deleteTarget.document_id),
      );
      showToast(`"${deleteTarget.document_name}" has been deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      if (err.response?.status === 409) {
        // Controller returns 409 when doc has existing requests
        setDeleteBlockMsg(
          err.response.data.message || "Cannot delete this document type.",
        );
      } else {
        showToast(err.response?.data?.message || "Failed to delete.", "error");
        setDeleteTarget(null);
      }
    } finally {
      setModalLoading(false);
    }
  };

  // ── Mutations ─────────────────────────────────────────────
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

  // ── Filtered docs ─────────────────────────────────────────
  const filteredDocs = documentTypes.filter((doc) => {
    const matchSearch = doc.document_name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "active" && doc.in_use) ||
      (filter === "inactive" && !doc.in_use);
    const matchHandler =
      handlerFilter === "all" ||
      (handlerFilter === "clerk" &&
        (doc.handler_role_id === 3 || doc.handler_role_id === "3")) ||
      (handlerFilter === "zone" &&
        (doc.handler_role_id === 4 || doc.handler_role_id === "4")) ||
      (handlerFilter === "unassigned" && !doc.handler_role_id);
    return matchSearch && matchFilter && matchHandler;
  });

  // ── Render ────────────────────────────────────────────────

  // Form view
  if (view === "add") {
    return (
      <DocumentForm
        selectedDoc={selectedDoc}
        docName={docName}
        setDocName={setDocName}
        docFee={docFee}
        setDocFee={setDocFee}
        docStatus={docStatus}
        setDocStatus={setDocStatus}
        handlerRoleId={handlerRoleId}
        setHandlerRoleId={setHandlerRoleId}
        documentFile={documentFile}
        existingFilePath={existingFilePath}
        displayFileName={displayFileName}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        handleRemoveFile={handleRemoveFile}
        onOpenFile={handleOpenFile}
        requirements={requirements}
        addReq={addReq}
        removeReq={removeReq}
        updateReq={updateReq}
        fields={fields}
        addField={addField}
        removeField={removeField}
        updateField={updateField}
        saving={saving}
        formError={formError}
        handleSave={handleSave}
        onBack={() => {
          setView("list");
          resetForm();
        }}
      />
    );
  }

  // Skeleton while loading
  if (loadingList) return <DocumentListSkeleton />;

  // List view
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Keep for backwards-compat but we use our own Toast below */}
      <DocumentToast toast={{ show: false, message: "", type: "success" }} />

      <DocumentList
        documentTypes={documentTypes}
        loadingList={false}
        listError={listError}
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        handlerFilter={handlerFilter}
        setHandlerFilter={setHandlerFilter}
        filteredDocs={filteredDocs}
        onEdit={handleEditDoc}
        onOpenFile={handleOpenFile}
        onNew={() => {
          resetForm();
          setView("add");
        }}
        onRetry={fetchDocumentTypes}
        onDisable={(doc) => {
          setDeleteBlockMsg(null);
          setDisableTarget(doc);
        }}
        onDelete={(doc) => {
          setDeleteBlockMsg(null);
          setDeleteTarget(doc);
        }}
      />

      {/* ── Disable / Enable Modal ── */}
      {disableTarget && (
        <DisableModal
          doc={disableTarget}
          onConfirm={handleDisableConfirm}
          onCancel={() => {
            setDisableTarget(null);
          }}
          loading={modalLoading}
        />
      )}

      {/* ── Delete Modal ── */}
      {deleteTarget && (
        <DeleteModal
          doc={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setDeleteTarget(null);
            setDeleteBlockMsg(null);
          }}
          loading={modalLoading}
          blockReason={deleteBlockMsg}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default DocumentsManagement;
