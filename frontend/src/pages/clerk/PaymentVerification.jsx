import React, { useState, useMemo } from "react";
import {
  Search,
  Eye,
  Check,
  X,
  Calendar,
  FileText,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Wallet,
  Coins,
  ShoppingCart,
} from "lucide-react";

const PaymentVerification = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const DOCUMENT_PRICE = 50; // Price per document in pesos

  const [requests, setRequests] = useState([
    {
      id: "REQ-001",
      resident: "Juan Luna",
      email: "juan@example.com",
      documents: [
        "Certificate of Indigency",
        "Barangay Clearance",
        "Certificate of Residency",
      ],
      date: "2 mins ago",
      dateCreated: "Jan 29, 2026",
      status: "Pending",
      purpose: "Medical assistance and employment requirements",
      avatar: "JL",
      paymentStatus: "Unpaid",
    },
    {
      id: "REQ-002",
      resident: "Andres Bonifacio",
      email: "andres@example.com",
      documents: ["Barangay Clearance"],
      date: "1 hour ago",
      dateCreated: "Jan 29, 2026",
      status: "In Progress",
      purpose: "Employment requirement",
      avatar: "AB",
      paymentStatus: "Unpaid",
    },
    {
      id: "REQ-003",
      resident: "Maria Clara",
      email: "maria@example.com",
      documents: ["Certificate of Residency", "Barangay ID"],
      date: "3 hours ago",
      dateCreated: "Jan 29, 2026",
      status: "Approved",
      purpose: "School enrollment",
      avatar: "MC",
      paymentStatus: "Paid",
    },
    {
      id: "REQ-004",
      resident: "Jose Rizal",
      email: "jose@example.com",
      documents: ["Business Permit", "Barangay Clearance"],
      date: "5 hours ago",
      dateCreated: "Jan 28, 2026",
      status: "Pending",
      purpose: "New business application",
      avatar: "JR",
      paymentStatus: "Unpaid",
    },
    {
      id: "REQ-005",
      resident: "Gabriela Silang",
      email: "gabriela@example.com",
      documents: ["Barangay ID"],
      date: "1 day ago",
      dateCreated: "Jan 28, 2026",
      status: "Rejected",
      purpose: "Government transaction",
      rejectionReason: "Incomplete requirements",
      avatar: "GS",
      paymentStatus: "Unpaid",
    },
  ]);

  // Calculate total payment for a request
  const calculateTotal = (documents) => {
    return documents.length * DOCUMENT_PRICE;
  };

  // Filter and search logic
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        req.resident.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.documents.some((doc) =>
          doc.toLowerCase().includes(searchTerm.toLowerCase()),
        ) ||
        req.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" ||
        req.status.toLowerCase().replace(" ", "") ===
          filterStatus.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterStatus, requests]);

  // Handle actions
  const handleApprove = (id) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: "Approved" } : req)),
    );
  };

  const handleReject = (id) => {
    const reason = prompt("Enter rejection reason:");
    if (reason && reason.trim()) {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id
            ? { ...req, status: "Rejected", rejectionReason: reason }
            : req,
        ),
      );
    }
  };

  const handleView = (request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const togglePaymentStatus = (id) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              paymentStatus: req.paymentStatus === "Paid" ? "Unpaid" : "Paid",
            }
          : req,
      ),
    );
  };

  // Stats
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "Pending").length,
    inProgress: requests.filter((r) => r.status === "In Progress").length,
    approved: requests.filter((r) => r.status === "Approved").length,
    rejected: requests.filter((r) => r.status === "Rejected").length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Approved":
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
      case "In Progress":
        return <AlertCircle size={12} />;
      case "Approved":
        return <CheckCircle2 size={12} />;
      case "Rejected":
        return <XCircle size={12} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Document Requests
        </h1>
        <p className="text-gray-500">
          Review and manage resident document requests
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFilterStatus("all")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Total Requests
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {stats.total}
              </h3>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <FileText size={20} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFilterStatus("pending")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Pending
              </p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                {stats.pending}
              </h3>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white shadow-md">
              <Clock size={20} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFilterStatus("inprogress")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                In Progress
              </p>
              <h3 className="text-2xl font-black text-blue-600 mt-1">
                {stats.inProgress}
              </h3>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <AlertCircle size={20} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFilterStatus("approved")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Approved
              </p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {stats.approved}
              </h3>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <CheckCircle2 size={20} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFilterStatus("rejected")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Rejected
              </p>
              <h3 className="text-2xl font-black text-red-600 mt-1">
                {stats.rejected}
              </h3>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <XCircle size={20} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TABLE CARD */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* SEARCH & FILTERS BAR */}
        <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-gray-50 to-white">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
              placeholder="Search by resident, document, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === "all"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("pending")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all relative ${
                  filterStatus === "pending"
                    ? "bg-white text-amber-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Pending
                {stats.pending > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {stats.pending}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilterStatus("inprogress")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === "inprogress"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilterStatus("approved")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === "approved"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Approved
              </button>
            </div>

            <button className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
              <Download size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* TABLE */}
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
      </div>

      {/* VIEW MODAL */}
      {showViewModal && selectedRequest && (
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
                    <p className="text-xs font-bold text-gray-700 mb-1">
                      Purpose:
                    </p>
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
                {selectedRequest.status !== "Pending" && (
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
      )}
    </div>
  );
};

export default PaymentVerification;
