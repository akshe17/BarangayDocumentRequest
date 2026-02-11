import React from "react";
import {
  X,
  Calendar,
  FileText,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wallet,
  Check,
} from "lucide-react";

const ViewModal = ({
  selectedRequest,
  setShowViewModal,
  handleApprove,
  handleReject,
  handleComplete,
  togglePaymentStatus,
  calculateTotal,
  DOCUMENT_PRICE,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Approved":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock size={12} />;
      case "Approved":
        return <AlertCircle size={12} />;
      case "Completed":
        return <CheckCircle2 size={12} />;
      case "Rejected":
        return <XCircle size={12} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8">
        {/* MODAL HEADER */}
        <div className="sticky top-0 z-10 p-5 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-2xl">
          <h3 className="font-black text-gray-900 text-base flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText size={18} className="text-blue-600" />
            </div>
            Request Details
          </h3>
          <button
            onClick={() => setShowViewModal(false)}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 max-h-[calc(100vh-200px)] overflow-y-auto space-y-4">
          {/* Request ID & Status */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Request ID
                </p>
                <p className="text-lg font-black text-gray-900 mt-1">
                  {selectedRequest.id}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase border ${getStatusColor(
                  selectedRequest.status,
                )}`}
              >
                {getStatusIcon(selectedRequest.status)}
                {selectedRequest.status}
              </span>
            </div>
          </div>

          {/* Resident Info */}
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              Resident Information
            </h4>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-black text-base shadow-md">
                {selectedRequest.avatar}
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {selectedRequest.resident}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-0.5">
                  <User size={12} />
                  {selectedRequest.email}
                </p>
              </div>
            </div>
          </div>

          {/* Requested Documents */}
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              Requested Documents ({selectedRequest.documents.length})
            </h4>
            <div className="space-y-2">
              {selectedRequest.documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-emerald-600" />
                    <span className="font-semibold text-gray-900 text-sm">
                      {doc}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-emerald-700">
                    ₱{DOCUMENT_PRICE}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border-2 border-amber-300">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                  Payment Summary
                </h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between gap-8">
                    <span className="text-gray-600">
                      {selectedRequest.documents.length} document(s) × ₱
                      {DOCUMENT_PRICE}
                    </span>
                    <span className="font-semibold text-gray-900">
                      ₱{calculateTotal(selectedRequest.documents)}
                    </span>
                  </div>
                  <div className="pt-2 border-t-2 border-amber-200 flex items-center justify-between">
                    <span className="font-bold text-gray-900">
                      Total Amount:
                    </span>
                    <span className="text-2xl font-black text-amber-700">
                      ₱{calculateTotal(selectedRequest.documents)}
                    </span>
                  </div>
                </div>
              </div>
              <Wallet size={32} className="text-amber-600" />
            </div>

            <div className="bg-white p-3 rounded-lg border border-amber-200 mt-3">
              <div className="flex items-start gap-2">
                <AlertCircle
                  size={16}
                  className="text-amber-600 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    Payment Method
                  </p>
                  <p className="text-xs text-gray-700 mt-1">
                    Payment will be received at the{" "}
                    <span className="font-bold">Barangay Counter</span> upon
                    document collection.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Status Toggle */}
            <div className="mt-3 flex items-center justify-between bg-white p-3 rounded-lg border border-amber-200">
              <span className="text-sm font-bold text-gray-700">
                Payment Status:
              </span>
              <button
                onClick={() => togglePaymentStatus(selectedRequest.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedRequest.paymentStatus === "Paid"
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                {selectedRequest.paymentStatus === "Paid"
                  ? "✓ Paid"
                  : "✗ Unpaid"}
              </button>
            </div>
          </div>

          {/* Submission Info */}
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              Submission Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={14} className="text-gray-400" />
                <span>
                  Submitted {selectedRequest.date} (
                  {selectedRequest.dateCreated})
                </span>
              </div>
              <div className="mt-3">
                <p className="text-xs font-bold text-gray-700 mb-1">Purpose:</p>
                <p className="text-sm text-gray-700">
                  {selectedRequest.purpose}
                </p>
              </div>
            </div>
          </div>

          {/* Rejection Reason */}
          {selectedRequest.status === "Rejected" &&
            selectedRequest.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <XCircle
                    size={18}
                    className="text-red-600 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="font-bold text-red-900 text-sm">
                      Rejection Reason
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      {selectedRequest.rejectionReason}
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* MODAL FOOTER */}
        <div className="sticky bottom-0 p-5 border-t border-gray-200 bg-white rounded-b-2xl">
          <div className="flex gap-3">
            {selectedRequest.status === "Pending" && (
              <>
                <button
                  onClick={() => {
                    handleReject(selectedRequest.id);
                    setShowViewModal(false);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all text-sm shadow-lg hover:scale-105 flex items-center justify-center gap-2"
                >
                  <X size={16} />
                  Reject
                </button>
                <button
                  onClick={() => {
                    handleApprove(selectedRequest.id);
                    setShowViewModal(false);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 transition-all text-sm shadow-lg hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  Approve
                </button>
              </>
            )}
            {selectedRequest.status === "Approved" && (
              <button
                onClick={() => {
                  handleComplete(selectedRequest.id);
                  setShowViewModal(false);
                }}
                className="w-full px-4 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 transition-all text-sm shadow-lg hover:scale-105 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                Mark as Completed
              </button>
            )}
            {(selectedRequest.status === "Completed" ||
              selectedRequest.status === "Rejected") && (
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full px-4 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all text-sm"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewModal;
