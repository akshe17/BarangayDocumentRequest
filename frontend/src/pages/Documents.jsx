import React, { useState, useEffect, useMemo } from "react";
import api from "../axious/api";
import Toast from "../components/toast"; // --- ADDED: Import Toast component ---
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Coins,
  AlertTriangle,
  X,
  Check,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  ListPlus,
  Loader2,
} from "lucide-react";

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalType, setModalType] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- ADDED: Toast state ---
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [formData, setFormData] = useState({
    name: "",
    fee: "",
    requirements: [],
  });

  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  // --- ADDED: Toast helper function ---
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/documents");
      setDocuments(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to fetch documents.");
      showToast("Failed to fetch documents.", "error"); // --- ADDED ---
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const docName = doc.document_name || "";
      return docName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [documents, searchTerm]);

  const stats = {
    total: documents.length,
    active: documents.filter((d) => d.in_use).length,
    inactive: documents.filter((d) => !d.in_use).length,
    totalRevenue: documents.reduce(
      (sum, doc) => sum + (parseFloat(doc.fee) || 0),
      0,
    ),
  };

  const openModal = (type, document = null) => {
    setModalType(type);
    setSelectedDocument(document);

    if (document && type === "edit") {
      setFormData({
        name: document.document_name || "",
        fee: document.fee || "",
        requirements: document.requirements || [],
      });
    } else {
      setFormData({ name: "", fee: "", requirements: [] });
    }
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedDocument(null);
    setFormData({ name: "", fee: "", requirements: [] });
  };

  const addRequirementField = () => {
    setFormData({
      ...formData,
      requirements: [
        ...formData.requirements,
        { requirement_name: "", description: "" },
      ],
    });
  };

  const updateRequirement = (index, field, value) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index][field] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const removeRequirement = (index) => {
    const newRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData({ ...formData, requirements: newRequirements });
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim() || formData.fee === "") {
      showToast("Please fill in Document Name and Fee", "error"); // --- UPDATED ---
      return;
    }

    const docData = {
      name: formData.name.trim(),
      fee: parseFloat(formData.fee),
      requirements: formData.requirements,
    };

    try {
      if (modalType === "add") {
        const response = await api.post("/documents", docData);
        setDocuments([...documents, response.data]);
        showToast("Document added successfully!"); // --- ADDED ---
      } else if (modalType === "edit") {
        if (!selectedDocument || !selectedDocument.document_id) {
          showToast("Error: Document ID not found.", "error"); // --- UPDATED ---
          return;
        }

        const response = await api.put(
          `/documents/${selectedDocument.document_id}`,
          docData,
        );

        setDocuments(
          documents.map((doc) =>
            doc.document_id === selectedDocument.document_id
              ? response.data
              : doc,
          ),
        );
        showToast("Document updated successfully!"); // --- ADDED ---
      }
      closeModal();
    } catch (err) {
      console.error("Error saving document:", err);
      showToast(
        `Failed to save document: ${err.response?.data?.message || err.message}`,
        "error",
      ); // --- UPDATED ---
    }
  };

  const handleDelete = async () => {
    if (!selectedDocument || !selectedDocument.document_id) {
      showToast("Error: Document ID not found.", "error"); // --- UPDATED ---
      return;
    }

    if (selectedDocument.in_use) {
      setModalType("warning");
      return;
    }

    try {
      await api.delete(`/documents/${selectedDocument.document_id}`);

      setDocuments(
        documents.filter(
          (doc) => doc.document_id !== selectedDocument.document_id,
        ),
      );
      showToast("Document deleted successfully!"); // --- ADDED ---
      closeModal();
    } catch (err) {
      console.error("Error deleting document:", err);
      showToast("Failed to delete document.", "error"); // --- UPDATED ---
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* --- ADDED: Toast component implementation --- */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Document Management
        </h1>
      </div>

      {/* ERROR DISPLAY */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 font-medium text-sm">
          {error}
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Total Documents
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {isLoading ? <Loader2 className="animate-spin" /> : stats.total}
              </h3>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Package size={24} strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Active
              </p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  stats.active
                )}
              </h3>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <CheckCircle2 size={24} strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Inactive
              </p>
              <h3 className="text-2xl font-black text-gray-600 mt-1">
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  stats.inactive
                )}
              </h3>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Clock size={24} strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Total Fees (Type)
              </p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  `₱${stats.totalRevenue.toLocaleString()}`
                )}
              </h3>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <TrendingUp size={24} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH & ADD */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => openModal("add")}
            className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center gap-2 shadow-md whitespace-nowrap"
          >
            <Plus size={18} /> Add Document
          </button>
        </div>
      </div>

      {/* DOCUMENTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Loader2 className="animate-spin mx-auto mb-2" size={32} />
            Loading documents...
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-xl border border-gray-200 shadow-sm text-center">
            <Search size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-sm text-gray-500">
              No documents found.
            </p>
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <div
              key={doc.document_id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
            >
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0">
                      <FileText size={24} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base mb-1 truncate">
                        {doc.document_name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${doc.in_use ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
                        >
                          {doc.in_use ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                      Processing Fee
                    </span>
                    <div className="flex items-center gap-2">
                      <Coins size={18} className="text-amber-600" />
                      <span className="text-2xl font-black text-amber-700">
                        ₱{doc.fee}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Requirements
                  </h4>
                  {doc.requirements && doc.requirements.length > 0 ? (
                    <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                      {doc.requirements.map((req, i) => (
                        <li key={i}>{req.requirement_name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      No requirements
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal("edit", doc)}
                    className="flex-1 px-4 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => openModal("delete", doc)}
                    className="flex-1 px-4 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODALS */}
      {modalType && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-8">
            <div className="sticky top-0 z-10 p-5 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-2xl">
              <h3 className="font-black text-gray-900 text-base flex items-center gap-3">
                {modalType === "add" && "Add New Document"}
                {modalType === "edit" && "Edit Document"}
                {modalType === "delete" && "Delete Document"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              {(modalType === "add" || modalType === "edit") && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">
                      Document Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white outline-none focus:border-emerald-500 transition-all font-medium text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">
                      Processing Fee (₱)
                    </label>
                    <input
                      type="number"
                      value={formData.fee}
                      onChange={(e) =>
                        setFormData({ ...formData, fee: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white outline-none focus:border-emerald-500 transition-all font-medium text-sm"
                    />
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block">
                        Requirements
                      </label>
                      <button
                        type="button"
                        onClick={addRequirementField}
                        className="text-xs text-emerald-600 font-bold flex items-center gap-1 hover:text-emerald-700"
                      >
                        <ListPlus size={14} /> Add Requirement
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formData.requirements.map((req, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200"
                        >
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              placeholder="Requirement Name (e.g., Valid ID)"
                              value={req.requirement_name}
                              onChange={(e) =>
                                updateRequirement(
                                  index,
                                  "requirement_name",
                                  e.target.value,
                                )
                              }
                              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300"
                            />
                            <input
                              type="text"
                              placeholder="Description (e.g., Photocopy of...)"
                              value={req.description}
                              onChange={(e) =>
                                updateRequirement(
                                  index,
                                  "description",
                                  e.target.value,
                                )
                              }
                              className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeRequirement(index)}
                            className="text-red-400 hover:text-red-600 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {modalType === "delete" && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Trash2 size={32} strokeWidth={2} />
                  </div>
                  <p className="text-base font-bold text-gray-900 mb-2">
                    Delete "{selectedDocument?.document_name}"?
                  </p>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone.
                  </p>
                </div>
              )}
              {modalType === "warning" && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <AlertTriangle size={32} strokeWidth={2} />
                  </div>
                  <p className="text-base font-bold text-gray-900 mb-2">
                    Cannot Delete Document
                  </p>
                  <p className="text-sm text-gray-500">
                    This document is currently in use or has active requests.
                  </p>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 p-5 border-t border-gray-200 bg-white rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all text-sm"
                >
                  Cancel
                </button>
                {modalType !== "warning" && (
                  <button
                    onClick={modalType === "delete" ? handleDelete : handleSave}
                    className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-white transition-all text-sm shadow-lg flex items-center justify-center gap-2 ${modalType === "delete" ? "bg-gradient-to-r from-red-600 to-red-700" : "bg-gradient-to-r from-emerald-600 to-green-600"}`}
                  >
                    {modalType === "delete" ? (
                      <>
                        <Trash2 size={16} /> Delete Document
                      </>
                    ) : (
                      <>
                        <Check size={16} /> Save Changes
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
