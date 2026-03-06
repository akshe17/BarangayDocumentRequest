import React, { useState, useMemo } from "react";
import Toast from "../../components/toast";
import Skeleton from "../../components/Skeleton";
import {
  FileText,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Send,
  ClipboardList,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNewRequest } from "../../context/NewRequestContext";

// ─── helpers ────────────────────────────────────────────────────────────────

const STATUS_BLOCKED = [
  "pending",
  "processing",
  "approved",
  "ready for pickup",
];

const statusMeta = {
  pending: { label: "Pending", color: "#f59e0b", bg: "#fffbeb", Icon: Clock },
  processing: {
    label: "Processing",
    color: "#3b82f6",
    bg: "#eff6ff",
    Icon: Loader2,
  },
  approved: {
    label: "Approved",
    color: "#10b981",
    bg: "#ecfdf5",
    Icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "#ef4444",
    bg: "#fef2f2",
    Icon: XCircle,
  },
  completed: {
    label: "Completed",
    color: "#6b7280",
    bg: "#f9fafb",
    Icon: CheckCircle,
  },
};

const GENDER_MAP = { 1: "Male", 2: "Female", 3: "Other" };
const CIVIL_STATUS_MAP = {
  1: "Single",
  2: "Married",
  3: "Widowed",
  4: "Separated",
  5: "Annulled",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getBlockedStatus(doc, existingRequests) {
  if (!existingRequests?.length) return null;
  const match = existingRequests.find((r) => {
    if (r.document_id !== doc.document_id) return false;
    const statusName = (r.status?.status_name ?? "").toLowerCase();
    return STATUS_BLOCKED.includes(statusName);
  });
  if (!match) return null;
  return (match.status?.status_name ?? "").toLowerCase();
}

// ─── Read-only field ──────────────────────────────────────────────────────────

function ReadOnlyField({ label, value }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        {label}
        <span className="text-[9px] font-semibold text-emerald-500 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md tracking-wide normal-case">
          auto-filled
        </span>
      </label>
      <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700 font-medium select-none">
        {value || "—"}
      </div>
    </div>
  );
}

// ─── Resident Info Fields ─────────────────────────────────────────────────────

function ResidentInfoFields({ user }) {
  const resident = user?.resident;

  const fullName =
    [user?.first_name, user?.middle_name, user?.last_name]
      .filter(Boolean)
      .join(" ") || "—";

  const gender = GENDER_MAP[resident?.gender_id] ?? "—";
  const civilStatus = CIVIL_STATUS_MAP[resident?.civil_status_id] ?? "—";
  const birthdate = formatDate(resident?.birthdate);

  // ✅ Correct path: resident.zone.zone_name, fallback to top-level zone_name
  const zone = resident?.zone?.zone_name ?? user?.zone_name ?? "—";
  const houseNo = resident?.house_no ?? "—";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
          Your Information
        </p>
      </div>
      <div className="p-5 sm:p-6 space-y-4">
        <ReadOnlyField label="Full Name" value={fullName} />
        <div className="grid grid-cols-2 gap-4">
          <ReadOnlyField label="Date of Birth" value={birthdate} />
          <ReadOnlyField label="Gender" value={gender} />
          <ReadOnlyField label="Civil Status" value={civilStatus} />
          <ReadOnlyField label="Zone" value={zone} />
        </div>
        <ReadOnlyField label="House No." value={houseNo} />
      </div>
    </div>
  );
}

// ─── Dynamic Field Input ──────────────────────────────────────────────────────

function FieldInput({ field, value, onChange }) {
  const base =
    "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all";

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
        {field.field_label}
        {field.is_required ? (
          <span className="text-red-400 font-bold">*</span>
        ) : (
          <span className="text-gray-300 font-normal normal-case text-[10px]">
            (optional)
          </span>
        )}
      </label>
      {field.field_type === "textarea" ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(field.field_id, e.target.value)}
          placeholder={`Enter ${field.field_label.toLowerCase()}…`}
          className={`${base} resize-none`}
        />
      ) : field.field_type === "date" ? (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(field.field_id, e.target.value)}
          className={base}
        />
      ) : field.field_type === "number" ? (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(field.field_id, e.target.value)}
          placeholder="0"
          className={base}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(field.field_id, e.target.value)}
          placeholder={`Enter ${field.field_label.toLowerCase()}…`}
          className={base}
        />
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonDocumentPicker({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-full rounded-2xl border border-gray-100 bg-white p-5 sm:p-6"
        >
          <div className="flex items-center gap-4">
            <Skeleton.Block className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton.Block
                className={`h-3.5 ${i % 3 === 0 ? "w-48" : i % 3 === 1 ? "w-36" : "w-56"}`}
              />
              <div className="flex items-center gap-3">
                <Skeleton.Block className="h-3 w-10" />
                <Skeleton.Block className="h-3 w-24" />
              </div>
            </div>
            <Skeleton.Block className="w-4 h-4 rounded shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── VIEW 1: Document Picker ─────────────────────────────────────────────────

function DocumentPicker({
  documentList,
  existingRequests,
  onSelect,
  isLoading,
  error,
  onRetry,
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return documentList;
    const q = search.toLowerCase();
    return documentList?.filter((doc) =>
      doc.document_name.toLowerCase().includes(q),
    );
  }, [documentList, search]);

  if (isLoading) return <SkeletonDocumentPicker count={5} />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertCircle size={24} className="text-red-400" />
        </div>
        <p className="text-sm font-semibold text-gray-600">
          Failed to load documents
        </p>
        <button
          onClick={onRetry}
          className="text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative mb-4">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents…"
          className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-9 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Empty search result */}
      {filtered?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
            <FileText size={20} className="text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-400">
            No documents match "<span className="text-gray-600">{search}</span>"
          </p>
          <button
            onClick={() => setSearch("")}
            className="text-xs font-semibold text-emerald-600 hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Document cards */}
      {filtered?.map((doc) => {
        const blockedStatus = getBlockedStatus(doc, existingRequests);
        const isBlocked = !!blockedStatus;
        const meta = blockedStatus ? statusMeta[blockedStatus] : null;
        const StatusIcon = meta?.Icon;
        const fee = parseFloat(doc.fee) || 0;
        const reqCount = doc.requirements?.length ?? 0;
        const fieldCount = doc.form_fields?.length ?? 0;

        return (
          <button
            key={doc.document_id}
            onClick={() => !isBlocked && onSelect(doc)}
            disabled={isBlocked}
            className={`w-full text-left group rounded-2xl border transition-all duration-200 ${
              isBlocked
                ? "bg-gray-50 border-gray-100 cursor-not-allowed opacity-60"
                : "bg-white border-gray-200 hover:border-emerald-300 hover:shadow-md cursor-pointer active:scale-[0.99]"
            }`}
          >
            <div className="p-5 sm:p-6 flex items-center gap-4">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  isBlocked
                    ? "bg-gray-100"
                    : "bg-emerald-50 group-hover:bg-emerald-500"
                }`}
              >
                <FileText
                  size={20}
                  className={
                    isBlocked
                      ? "text-gray-400"
                      : "text-emerald-500 group-hover:text-white transition-colors"
                  }
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-gray-800 truncate">
                    {doc.document_name}
                  </h3>
                  {isBlocked && meta && (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                      style={{ color: meta.color, background: meta.bg }}
                    >
                      <StatusIcon size={9} /> {meta.label}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span
                    className={`text-xs font-bold ${fee === 0 ? "text-emerald-500" : "text-gray-600"}`}
                  >
                    {fee === 0 ? "Free" : `₱${fee.toFixed(2)}`}
                  </span>
                  {reqCount > 0 && (
                    <span className="text-xs text-gray-400">
                      {reqCount} requirement{reqCount > 1 ? "s" : ""}
                    </span>
                  )}
                  {fieldCount > 0 && (
                    <span className="text-xs text-gray-400">
                      {fieldCount} form field{fieldCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {isBlocked && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    You have an active request. Re-request once it's completed
                    or rejected.
                  </p>
                )}
              </div>

              {!isBlocked && (
                <ChevronRight
                  size={18}
                  className="text-gray-300 group-hover:text-emerald-500 transition-colors shrink-0"
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── VIEW 2: Request Form ─────────────────────────────────────────────────────

function RequestForm({ doc, onSubmit, isSubmitting, user }) {
  const [formValues, setFormValues] = useState(() => {
    const init = {};
    doc.form_fields?.forEach((f) => {
      init[f.field_id] = "";
    });
    return init;
  });
  const [purpose, setPurpose] = useState("");
  const [validationError, setValidationError] = useState(null);

  const fee = parseFloat(doc.fee) || 0;

  const handleFieldChange = (fieldId, value) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
    setValidationError(null);
  };

  const handleSubmit = () => {
    const missing = doc.form_fields?.filter(
      (f) => f.is_required && !formValues[f.field_id]?.trim(),
    );
    if (missing?.length) {
      setValidationError(
        `Please fill in: ${missing.map((f) => f.field_label).join(", ")}`,
      );
      return;
    }
    if (!purpose.trim()) {
      setValidationError("Please provide a purpose for your request.");
      return;
    }
    onSubmit({ formValues, purpose });
  };

  return (
    <div className="space-y-5">
      {/* Doc header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
        <div className="p-5 sm:p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
            <FileText size={22} className="text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-800 truncate">
              {doc.document_name}
            </h2>
            <p
              className={`text-sm font-semibold mt-0.5 ${fee === 0 ? "text-emerald-500" : "text-gray-500"}`}
            >
              {fee === 0 ? "Free" : `Processing fee: ₱${fee.toFixed(2)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Requirements */}
      {doc.requirements?.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList size={15} className="text-amber-600" />
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Required Documents to Bring
            </p>
          </div>
          <ul className="space-y-2">
            {doc.requirements.map((req) => (
              <li key={req.requirement_id} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-amber-800">
                    {req.requirement_name}
                  </span>
                  {req.description && (
                    <span className="text-xs text-amber-600">
                      {" "}
                      — {req.description}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Resident Info (read-only) */}
      <ResidentInfoFields user={user} />

      {/* Dynamic form fields */}
      {doc.form_fields?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              Additional Details
            </p>
          </div>
          <div className="p-5 sm:p-6 space-y-4">
            {doc.form_fields.map((field) => (
              <FieldInput
                key={field.field_id}
                field={field}
                value={formValues[field.field_id]}
                onChange={handleFieldChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* Purpose */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
            Purpose of Request <span className="text-red-400">*</span>
          </p>
        </div>
        <div className="p-5 sm:p-6">
          <textarea
            rows={3}
            value={purpose}
            onChange={(e) => {
              setPurpose(e.target.value);
              setValidationError(null);
            }}
            placeholder="Briefly explain why you need this document…"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all resize-none"
          />
        </div>
      </div>

      {/* Validation error */}
      {validationError && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Payment notice */}
      <div className="flex gap-3 items-start p-4 bg-blue-50 rounded-2xl border border-blue-100">
        <AlertCircle size={15} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          Payment of{" "}
          <strong>{fee === 0 ? "₱0.00 (Free)" : `₱${fee.toFixed(2)}`}</strong>{" "}
          is collected upon claiming at the Barangay Hall. Prepare the exact
          amount.
        </p>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-sm active:scale-[0.99]"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Submitting…
          </>
        ) : (
          <>
            <Send size={15} /> Submit Request
          </>
        )}
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const NewRequest = () => {
  const { user } = useAuth();
  const {
    documentList,
    existingRequests,
    isLoading,
    error,
    isSubmitting,
    retry,
    submitRequest,
  } = useNewRequest();

  const [view, setView] = useState("pick");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      4000,
    );
  };

  const handleSelectDoc = (doc) => {
    setSelectedDoc(doc);
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setSelectedDoc(null);
    setView("pick");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async ({ formValues, purpose }) => {
    const result = await submitRequest({
      documentId: selectedDoc.document_id,
      formValues,
      purpose,
    });
    if (result.success) {
      triggerToast(
        "Request submitted! Track it in your request history.",
        "success",
      );
      setView("pick");
      setSelectedDoc(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      triggerToast(result.message, "error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      {/* Header */}
      <div className="mb-8">
        {view === "form" && (
          <button
            onClick={handleBack}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-emerald-600 uppercase tracking-wider transition-colors mb-5 disabled:opacity-50"
          >
            <ArrowLeft size={14} /> Back to documents
          </button>
        )}

        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          {view === "pick" ? "Request a Document" : selectedDoc?.document_name}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {view === "pick"
            ? "Choose the document you need below."
            : "Fill in the details to submit your request."}
        </p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-4">
          <div
            className={`h-1 rounded-full transition-all duration-300 ${view === "pick" ? "w-8 bg-emerald-500" : "w-4 bg-gray-200"}`}
          />
          <div
            className={`h-1 rounded-full transition-all duration-300 ${view === "form" ? "w-8 bg-emerald-500" : "w-4 bg-gray-200"}`}
          />
        </div>
      </div>

      {view === "pick" ? (
        <DocumentPicker
          documentList={documentList}
          existingRequests={existingRequests}
          onSelect={handleSelectDoc}
          isLoading={isLoading}
          error={error}
          onRetry={retry}
        />
      ) : (
        <RequestForm
          doc={selectedDoc}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          user={user}
        />
      )}
    </div>
  );
};

export default NewRequest;
