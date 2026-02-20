import React, { useState } from "react";
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
} from "lucide-react";

const Documents = () => {
  const [view, setView] = useState("list");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "active" | "inactive"

  const [docName, setDocName] = useState("");
  const [docFee, setDocFee] = useState("");
  const [docStatus, setDocStatus] = useState(true);
  const [documentFile, setDocumentFile] = useState(null);
  const [requirements, setRequirements] = useState([
    { name: "", description: "" },
  ]);
  const [fields, setFields] = useState([
    { label: "", type: "text", is_required: true },
  ]);
  const [toast, setToast] = useState({ show: false, message: "" });

  const [documentTypes, setDocumentTypes] = useState([
    {
      id: 1,
      name: "Barangay Clearance",
      fee: "50.00",
      active: true,
      requirements: [
        { name: "Cedula", description: "Current year cedula" },
        { name: "ID", description: "Valid Government ID" },
      ],
      fields: [{ label: "Purpose", type: "text", is_required: true }],
    },
    {
      id: 2,
      name: "Certificate of Indigency",
      fee: "0.00",
      active: false,
      requirements: [{ name: "Voter's ID", description: "Proof of residency" }],
      fields: [{ label: "Reason", type: "textarea", is_required: true }],
    },
    {
      id: 3,
      name: "Business Permit",
      fee: "200.00",
      active: true,
      requirements: [
        { name: "DTI Certificate", description: "Business registration" },
      ],
      fields: [{ label: "Business Name", type: "text", is_required: true }],
    },
  ]);

  const showNotification = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const handleEditDoc = (doc) => {
    setSelectedDoc(doc);
    setDocName(doc.name);
    setDocFee(doc.fee);
    setDocStatus(doc.active);
    setRequirements(doc.requirements || [{ name: "", description: "" }]);
    setFields(doc.fields || [{ label: "", type: "text", is_required: true }]);
    setView("add");
  };

  const resetForm = () => {
    setSelectedDoc(null);
    setDocName("");
    setDocFee("");
    setDocStatus(true);
    setDocumentFile(null);
    setRequirements([{ name: "", description: "" }]);
    setFields([{ label: "", type: "text", is_required: true }]);
  };

  const addField = () =>
    setFields([...fields, { label: "", type: "text", is_required: true }]);
  const addReq = () =>
    setRequirements([...requirements, { name: "", description: "" }]);
  const removeField = (i) => setFields(fields.filter((_, idx) => idx !== i));
  const removeReq = (i) =>
    setRequirements(requirements.filter((_, idx) => idx !== i));
  const updateReq = (i, k, v) => {
    const n = [...requirements];
    n[i][k] = v;
    setRequirements(n);
  };
  const updateField = (i, k, v) => {
    const n = [...fields];
    n[i][k] = v;
    setFields(n);
  };

  const filteredDocs = documentTypes.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && doc.active) ||
      (filter === "inactive" && !doc.active);
    return matchesSearch && matchesFilter;
  });

  const icons = [FileText, Sparkles, FileText];

  // ── ADD / EDIT VIEW ──────────────────────────────────────────
  if (view === "add") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => {
                setView("list");
                resetForm();
              }}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all"
            >
              <ArrowLeft size={15} />
              Back
            </button>

            <div className="absolute left-1/2 -translate-x-1/2 text-center">
              <p className="text-sm font-semibold text-gray-800 leading-tight">
                {selectedDoc
                  ? `Edit ${selectedDoc.name}`
                  : "New Document Template"}
              </p>
              <p className="text-xs text-gray-400 leading-tight mt-0.5">
                {selectedDoc
                  ? "Update existing configuration"
                  : "Fill in the details below"}
              </p>
            </div>

            <button
              onClick={() => {
                showNotification(
                  selectedDoc ? "Template updated" : "Template saved",
                );
                setView("list");
                resetForm();
              }}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <Save size={15} />
              {selectedDoc ? "Update Template" : "Save Template"}
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10 space-y-4">
          {selectedDoc && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Document Status
                </p>
                <p className="text-xs text-gray-400">
                  Enable or disable this document for residents
                </p>
              </div>
              <button
                onClick={() => setDocStatus(!docStatus)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  docStatus
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-red-50 text-red-600 border border-red-100"
                }`}
              >
                <Power size={14} />
                {docStatus ? "Active" : "Disabled"}
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Basic Info
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">
                  Document Name
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
                  value={docFee}
                  onChange={(e) => setDocFee(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <ListChecks size={16} />
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  Entry Requirements
                </p>
              </div>
              <button
                onClick={addReq}
                className="text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                + Add
              </button>
            </div>
            <div className="space-y-3">
              {requirements.map((req, i) => (
                <div
                  key={i}
                  className="group relative p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2.5"
                >
                  <button
                    onClick={() => removeReq(i)}
                    className="absolute top-3.5 right-3.5 text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                  <input
                    value={req.name}
                    onChange={(e) => updateReq(i, "name", e.target.value)}
                    placeholder="Requirement name (e.g. Cedula)"
                    className="w-full bg-transparent border-b border-gray-200 pb-2 text-sm font-medium text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                  <textarea
                    value={req.description}
                    onChange={(e) =>
                      updateReq(i, "description", e.target.value)
                    }
                    placeholder="Additional instructions for residents..."
                    rows={2}
                    className="w-full bg-transparent text-xs text-gray-600 placeholder:text-gray-400 focus:outline-none resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <Settings size={16} />
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  Digital Form Fields
                </p>
              </div>
              <button
                onClick={addField}
                className="text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                + Add
              </button>
            </div>
            <div className="space-y-3">
              {fields.map((field, i) => (
                <div
                  key={i}
                  className="p-4 border border-gray-100 rounded-xl bg-white hover:border-emerald-100 transition-colors space-y-3"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Label
                      </label>
                      <input
                        value={field.label}
                        onChange={(e) =>
                          updateField(i, "label", e.target.value)
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
                        value={field.type}
                        onChange={(e) => updateField(i, "type", e.target.value)}
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
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-lg">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toast.message}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Document Types
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Configure requirements and fees for barangay services.
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setView("add");
            }}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Plus size={17} />
            New Template
          </button>
        </div>

        {/* Search + Filter bar */}
        <div className="flex bg-white rounded-xl shadow-md p-4 justify-between w-full gap-3 mb-6">
          <div className="relative  flex-1 w-full">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all "
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

          {/* Filter pills */}
          <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-xl p-1 shadow-sm">
            {[
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "inactive", label: "Inactive" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3.5 py-1.5 rounded-lg cursor-pointer text-xs font-semibold transition-all ${
                  filter === key
                    ? key === "inactive"
                      ? "bg-red-50 text-red-500"
                      : key === "active"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            const Icon = idx % 2 === 1 ? Sparkles : FileText;
            return (
              <div
                key={doc.id}
                onClick={() => handleEditDoc(doc)}
                className="group bg-white border border-gray-300 rounded-2xl p-6 cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-6">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      doc.active
                        ? "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      doc.active
                        ? "text-emerald-600 bg-emerald-50"
                        : "text-red-400 bg-red-50"
                    }`}
                  >
                    {doc.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">
                  {doc.name}
                </h3>
                <p className="text-sm text-gray-400">Fee: ₱ {doc.fee}</p>
                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex gap-5">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-300">
                        Requirements
                      </p>
                      <p className="text-sm font-medium text-gray-600 mt-0.5">
                        {doc.requirements.length} items
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-300">
                        Form Fields
                      </p>
                      <p className="text-sm font-medium text-gray-600 mt-0.5">
                        {doc.fields.length} fields
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all">
                    <ChevronRight size={17} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Only show add card when not filtering/searching */}
          {filter === "all" && !search && (
            <button
              onClick={() => {
                resetForm();
                setView("add");
              }}
              className="group border-2 border-dashed border-gray-200 rounded-2xl p-6 min-h-[220px] flex flex-col items-center justify-center gap-3 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-200"
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
      </div>
    </div>
  );
};

export default Documents;
