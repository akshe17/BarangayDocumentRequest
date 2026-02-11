import React from "react";
import {
  Search,
  Eye,
  Check,
  X,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Coins,
} from "lucide-react";

const RequestsTable = ({
  filteredRequests,
  calculateTotal,
  handleApprove,
  handleReject,
  handleComplete,
  handleView,
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
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">
              Request ID
            </th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">
              Resident
            </th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">
              Documents
            </th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">
              Total Amount
            </th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">
              Status
            </th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">
              Submitted
            </th>
            <th className="px-6 py-4 text-center text-[10px] font-black uppercase text-gray-500 tracking-widest">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredRequests.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <Search size={48} className="mb-3 opacity-50" />
                  <p className="font-semibold text-sm">No requests found</p>
                  <p className="text-xs mt-1">
                    Try adjusting your search or filters
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            filteredRequests.map((req) => (
              <tr
                key={req.id}
                className="hover:bg-gray-50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    {req.id}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md">
                      {req.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {req.resident}
                      </p>
                      <p className="text-xs text-gray-500">{req.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-black text-emerald-700">
                        {req.documents.length}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {req.documents.length === 1
                        ? "1 document"
                        : `${req.documents.length} documents`}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Coins size={16} className="text-amber-600" />
                    <span className="font-bold text-gray-900">
                      ₱{calculateTotal(req.documents)}
                    </span>
                  </div>
                  <span
                    className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                      req.paymentStatus === "Paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {req.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border ${getStatusColor(
                      req.status,
                    )}`}
                  >
                    {getStatusIcon(req.status)}
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar size={14} className="text-gray-400" />
                    <div>
                      <p className="font-medium">{req.date}</p>
                      <p className="text-[10px] text-gray-400">
                        {req.dateCreated}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    {req.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="p-2.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm hover:shadow-md"
                          title="Approve"
                        >
                          <Check size={16} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="p-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-md"
                          title="Reject"
                        >
                          <X size={16} strokeWidth={2.5} />
                        </button>
                      </>
                    )}
                    {req.status === "Approved" && (
                      <button
                        onClick={() => handleComplete(req.id)}
                        className="p-2.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm hover:shadow-md"
                        title="Mark as Completed"
                      >
                        <CheckCircle2 size={16} strokeWidth={2.5} />
                      </button>
                    )}
                    <button
                      onClick={() => handleView(req)}
                      className="p-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-900 hover:text-white transition-all shadow-sm hover:shadow-md"
                      title="View Details"
                    >
                      <Eye size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RequestsTable;
