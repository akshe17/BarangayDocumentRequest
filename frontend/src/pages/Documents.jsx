import React, { useState, useMemo } from "react";
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
} from "lucide-react";

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalType, setModalType] = useState(null); // 'add', 'edit', 'delete', 'warning'
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [formData, setFormData] = useState({ name: "", fee: "" });

  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Barangay Clearance",
      fee: 50,
      inUse: true,
      activeRequests: 12,
      totalIssued: 245,
      createdDate: "Jan 15, 2026",
      lastUpdated: "Jan 28, 2026",
    },
    {
      id: 2,
      name: "Certificate of Indigency",
      fee: 50,
      inUse: true,
      activeRequests: 8,
      totalIssued: 189,
      createdDate: "Jan 15, 2026",
      lastUpdated: "Jan 28, 2026",
    },
    {
      id: 3,
      name: "Certificate of Residency",
      fee: 50,
      inUse: true,
      activeRequests: 5,
      totalIssued: 312,
      createdDate: "Jan 15, 2026",
      lastUpdated: "Jan 28, 2026",
    },
  ]);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [documents, searchTerm]);

  // Stats
  const stats = {
    total: documents.length,
    active: documents.filter((d) => d.inUse).length,
    inactive: documents.filter((d) => !d.inUse).length,
    totalRevenue: documents.reduce(
      (sum, doc) => sum + doc.fee * doc.totalIssued,
      0,
    ),
  };

  // Modal handlers
  const openModal = (type, document = null) => {
    setModalType(type);
    setSelectedDocument(document);
    if (document && type === "edit") {
      setFormData({ name: document.name, fee: document.fee });
    } else {
      setFormData({ name: "", fee: "" });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedDocument(null);
    setFormData({ name: "", fee: "" });
  };

  const handleAdd = () => {
    if (!formData.name.trim() || !formData.fee) {
      alert("Please fill in all fields");
      return;
    }

    const newDocument = {
      id: documents.length + 1,
      name: formData.name.trim(),
      fee: parseFloat(formData.fee),
      inUse: false,
      activeRequests: 0,
      totalIssued: 0,
      createdDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      lastUpdated: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    setDocuments([...documents, newDocument]);
    closeModal();
  };

  const handleEdit = () => {
    if (!formData.name.trim() || !formData.fee) {
      alert("Please fill in all fields");
      return;
    }

    setDocuments(
      documents.map((doc) =>
        doc.id === selectedDocument.id
          ? {
              ...doc,
              name: formData.name.trim(),
              fee: parseFloat(formData.fee),
              lastUpdated: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            }
          : doc,
      ),
    );
    closeModal();
  };

  const handleDelete = () => {
    if (selectedDocument.inUse) {
      setModalType("warning");
      return;
    }

    setDocuments(documents.filter((doc) => doc.id !== selectedDocument.id));
    closeModal();
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Document Management
        </h1>
        <p className="text-gray-500">
          Manage available documents and their processing fees
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Total Documents
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {stats.total}
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
                {stats.active}
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
                {stats.inactive}
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
                Total Fee Collected
              </p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                ₱{stats.totalRevenue.toLocaleString()}
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
            className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 shadow-md whitespace-nowrap"
          >
            <Plus size={18} /> Add Document
          </button>
        </div>
      </div>

      {/* DOCUMENTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-xl border border-gray-200 shadow-sm text-center">
            <Search size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-sm text-gray-500">
              No documents found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your search
            </p>
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0">
                      <FileText size={24} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base mb-1 truncate">
                        {doc.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                            doc.inUse
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {doc.inUse ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5">
                {/* Fee */}
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

                {/* Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Active Requests:</span>
                    <span className="font-bold text-gray-900">
                      {doc.activeRequests}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Issued:</span>
                    <span className="font-bold text-gray-900">
                      {doc.totalIssued}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-bold text-emerald-600">
                      ₱{(doc.fee * doc.totalIssued).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Dates */}
                <div className="text-xs text-gray-500 space-y-1 mb-4 pt-3 border-t border-gray-100">
                  <p>Created: {doc.createdDate}</p>
                  <p>Updated: {doc.lastUpdated}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal("edit", doc)}
                    className="flex-1 px-4 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => openModal("delete", doc)}
                    className="flex-1 px-4 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
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
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl my-8">
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 p-5 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-2xl">
              <h3 className="font-black text-gray-900 text-base flex items-center gap-3">
                {modalType === "add" && (
                  <>
                    <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Plus size={18} className="text-emerald-600" />
                    </div>
                    Add New Document
                  </>
                )}
                {modalType === "edit" && (
                  <>
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Edit2 size={18} className="text-blue-600" />
                    </div>
                    Edit Document
                  </>
                )}
                {modalType === "delete" && (
                  <>
                    <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                      <Trash2 size={18} className="text-red-600" />
                    </div>
                    Delete Document
                  </>
                )}
                {modalType === "warning" && (
                  <>
                    <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle size={18} className="text-amber-600" />
                    </div>
                    Cannot Delete
                  </>
                )}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-5">
              {/* ADD/EDIT FORM */}
              {(modalType === "add" || modalType === "edit") && (
                <div className="space-y-4">
                  {/* Warning for Edit */}
                  {modalType === "edit" && selectedDocument?.inUse && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle
                          size={18}
                          className="text-amber-600 mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-amber-900 text-sm">
                            Important Notice
                          </p>
                          <p className="text-xs text-amber-800 mt-1">
                            This document is currently in use. Changes to the
                            fee will not affect existing requests, but will
                            apply to all future requests. Name changes will be
                            reflected in the system logs and audit trail.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">
                      Document Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Barangay Clearance"
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
                    <div className="relative">
                      <Coins
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="number"
                        placeholder="50"
                        min="0"
                        step="0.01"
                        value={formData.fee}
                        onChange={(e) =>
                          setFormData({ ...formData, fee: e.target.value })
                        }
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white outline-none focus:border-emerald-500 transition-all font-medium text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* DELETE CONFIRMATION */}
              {modalType === "delete" && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Trash2 size={32} strokeWidth={2} />
                  </div>
                  <p className="text-base font-bold text-gray-900 mb-2">
                    Delete "{selectedDocument?.name}"?
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    This action cannot be undone. The document will be
                    permanently removed from the system.
                  </p>

                  {selectedDocument?.totalIssued > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4">
                      <p className="text-xs text-amber-800">
                        <strong>Note:</strong> This document has been issued{" "}
                        {selectedDocument.totalIssued} time(s). Historical
                        records will be preserved.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* WARNING - CANNOT DELETE */}
              {modalType === "warning" && (
                <div className="text-center py-4">
                  <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <AlertTriangle size={40} strokeWidth={2} />
                  </div>
                  <p className="text-base font-bold text-gray-900 mb-2">
                    Cannot Delete Document
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    "{selectedDocument?.name}" cannot be deleted because it is
                    currently in use.
                  </p>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left">
                    <p className="font-bold text-red-900 text-sm mb-2">
                      Active Usage:
                    </p>
                    <ul className="space-y-2 text-sm text-red-800">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                        <span>
                          <strong>{selectedDocument?.activeRequests}</strong>{" "}
                          pending request(s)
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                        <span>
                          <strong>{selectedDocument?.totalIssued}</strong> total
                          issued
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mt-4">
                    <p className="text-xs text-blue-800">
                      <strong>Suggestion:</strong> Wait for all active requests
                      to be completed, then try deleting again. Or you can edit
                      the document instead.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="sticky bottom-0 p-5 border-t border-gray-200 bg-white rounded-b-2xl">
              {modalType === "warning" ? (
                <button
                  onClick={closeModal}
                  className="w-full px-4 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all text-sm"
                >
                  Understood
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={
                      modalType === "add"
                        ? handleAdd
                        : modalType === "edit"
                          ? handleEdit
                          : handleDelete
                    }
                    className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-white transition-all text-sm shadow-lg hover:scale-105 flex items-center justify-center gap-2 ${
                      modalType === "delete"
                        ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                        : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                    }`}
                  >
                    {modalType === "delete" ? (
                      <>
                        <Trash2 size={16} />
                        Delete Forever
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        {modalType === "add" ? "Add Document" : "Save Changes"}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
