import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  UserPlus,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  XCircle,
  Image as ImageIcon,
  Eye,
  RefreshCcw,
  Loader2, // Added for loading icon
} from "lucide-react";

import api from "../axious/api";
import Toast from "../components/toast";
// Assuming your Laravel backend runs on port 8000
const BASE_URL = "http://localhost:8000";

const AdminResidents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  // --- ACTION LOADING STATE ---
  // Tracks if an action (verify/reject) is in progress
  const [actionLoading, setActionLoading] = useState(false);
  // ----------------------------

  // Rejection Workflow State
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");

  // MODAL STATES
  const [modalType, setModalType] = useState(null);
  const [selectedResident, setSelectedResident] = useState(null);
  const [residents, setResidents] = useState([]);

  // --- TOAST STATE ---
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
  };
  // -------------------

  // FETCH RESIDENTS ON MOUNT
  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/residents-get");

      const formattedData = response.data.map((r) => ({
        id: r.resident_id,
        name: `${r.first_name} ${r.last_name}`,
        email: r.user?.email || "No Email",
        status: r.is_verified
          ? "Verified"
          : r.rejection_reason
            ? "Rejected"
            : "Pending",
        date: new Date(r.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        avatar: `${r.first_name[0]}${r.last_name[0]}`,

        // --- IMAGE URL HANDLING ---
        idUrl: r.id_image_path
          ? `${BASE_URL}/storage/${r.id_image_path}`
          : null,
        // --------------------------

        // Rejection reason comes from DB
        rejectionReason: r.rejection_reason,
        verifiedDate: r.updated_at
          ? new Date(r.updated_at).toLocaleDateString()
          : null,
      }));
      setResidents(formattedData);
    } catch (error) {
      console.error("Error fetching residents:", error);
      showToast("Failed to fetch residents", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredResidents = useMemo(() => {
    return residents.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === "all" || r.status.toLowerCase() === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, residents, filterStatus]);

  const openModal = (type, resident = null) => {
    setModalType(type);
    setSelectedResident(resident);
    setActiveMenu(null);
    setIsRejecting(false); // Reset rejection state
    setRejectionReasonInput("");
  };

  const closeModal = () => {
    if (actionLoading) return; // Prevent closing while action is in progress
    setModalType(null);
    setSelectedResident(null);
    setIsRejecting(false);
  };

  // --- HANDLE VERIFY ---
  const handleVerify = async (residentId) => {
    setActionLoading(true); // Start loading
    try {
      await api.post(`/residents/${residentId}/verify`);

      setResidents((prev) =>
        prev.map((r) =>
          r.id === residentId
            ? { ...r, status: "Verified", rejectionReason: null }
            : r,
        ),
      );

      showToast("Resident verified successfully", "success");
      closeModal();
    } catch (error) {
      console.error("Error approving resident:", error);
      showToast("Failed to verify resident", "error");
    } finally {
      setActionLoading(false); // Stop loading
    }
  };
  // ---------------------

  // --- HANDLE REJECT ---
  const handleReject = async (residentId) => {
    // 1. Check if the input is empty
    if (!rejectionReasonInput.trim()) {
      showToast("Please provide a rejection reason.", "warning");
      return;
    }

    setActionLoading(true); // Start loading
    try {
      // 2. Send the request
      await api.post(`/residents/${residentId}/reject`, {
        rejection_reason: rejectionReasonInput,
      });

      // 3. Update local UI state
      setResidents((prev) =>
        prev.map((r) =>
          r.id === residentId
            ? {
                ...r,
                status: "Rejected",
                rejectionReason: rejectionReasonInput,
              }
            : r,
        ),
      );

      showToast("Resident rejected and notified", "success");
      closeModal();
    } catch (error) {
      console.error("Error rejecting resident:", error);
      showToast("Failed to reject resident", "error");
    } finally {
      setActionLoading(false); // Stop loading
    }
  };
  // ---------------------

  const stats = {
    total: residents.length,
    verified: residents.filter((r) => r.status === "Verified").length,
    pending: residents.filter((r) => r.status === "Pending").length,
    rejected: residents.filter((r) => r.status === "Rejected").length,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 text-slate-900">
      {/* --- TOAST COMPONENT --- */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
      {/* ----------------------- */}

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Residents <span className="text-emerald-500">Directory</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Verification and account management portal.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchResidents}
            className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-600 shadow-sm"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => openModal("add")}
            className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-md shadow-emerald-200"
          >
            <UserPlus size={18} /> Add Resident
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: stats.total, color: "blue", icon: UserPlus },
          {
            label: "Verified",
            value: stats.verified,
            color: "emerald",
            icon: CheckCircle2,
          },
          {
            label: "Pending",
            value: stats.pending,
            color: "amber",
            icon: Clock,
          },
          {
            label: "Rejected",
            value: stats.rejected,
            color: "red",
            icon: XCircle,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 mb-3`}
            >
              <stat.icon size={20} />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              {stat.label}
            </p>
            <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* SEARCH & FILTERS */}
      <div className="max-w-7xl mx-auto bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all text-sm font-medium"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["all", "verified", "pending", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                filterStatus === s
                  ? "bg-slate-900 text-white shadow-lg"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center p-20 text-slate-400 animate-pulse font-bold">
              Loading...
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                <tr>
                  <th className="px-6 py-4 text-left">Resident</th>
                  <th className="px-6 py-4 text-left">Contact</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Registered</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredResidents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <Search size={48} className="mb-4 text-slate-300" />
                        <p className="text-lg font-bold">No results found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredResidents.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-600 text-xs border border-white shadow-sm group-hover:scale-110 transition-transform">
                            {r.avatar}
                          </div>
                          <div className="font-bold text-slate-900 text-sm tracking-tight">
                            {r.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                        {r.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                            r.status === "Verified"
                              ? "bg-emerald-50 text-emerald-600"
                              : r.status === "Rejected"
                                ? "bg-red-50 text-red-600"
                                : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              r.status === "Verified"
                                ? "bg-emerald-500"
                                : r.status === "Rejected"
                                  ? "bg-red-500"
                                  : "bg-amber-500 animate-pulse"
                            }`}
                          />
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                        {r.date}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openModal("verify", r)}
                          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 mx-auto ${
                            r.status === "Pending"
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-100 hover:bg-emerald-700"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {r.status === "Pending" ? (
                            <FileCheck size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                          {r.status === "Pending" ? "Review" : "Details"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalType === "verify" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={closeModal}
          />
          <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            {/* Left Side: ID Preview */}
            <div className="w-full md:w-1/2 bg-slate-100 p-6 flex flex-col border-r border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase text-slate-400 tracking-widest">
                  Valid ID Document
                </span>
                <ImageIcon size={16} className="text-slate-400" />
              </div>

              {/* --- DISPLAY IMAGE FROM STORAGE --- */}
              <div className="flex-1 bg-white rounded-2xl border-4 border-white shadow-inner overflow-hidden flex items-center justify-center bg-slate-200">
                {selectedResident?.idUrl ? (
                  <img
                    src={selectedResident.idUrl}
                    alt="Resident ID"
                    className="max-w-full max-h-full object-contain hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/600x400?text=Image+Not+Found";
                    }}
                  />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center">
                    <ImageIcon size={48} />
                    <p className="text-xs font-bold mt-2">NO ID UPLOADED</p>
                  </div>
                )}
              </div>
              {/* --------------------------------- */}
            </div>

            {/* Right Side: Details & Actions */}
            <div className="w-full md:w-1/2 p-8 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    {selectedResident?.name}
                  </h2>
                  <p className="text-slate-500 font-medium">
                    {selectedResident?.email}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  disabled={actionLoading}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 flex-1">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">
                    Registration Info
                  </p>
                  <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
                    <Calendar size={16} /> Joined {selectedResident?.date}
                  </div>
                </div>

                {isRejecting ? (
                  <div className="space-y-3 animate-in slide-in-from-top-2">
                    <p className="text-[10px] font-black uppercase text-red-500">
                      Specify Rejection Reason
                    </p>
                    <textarea
                      value={rejectionReasonInput}
                      onChange={(e) => setRejectionReasonInput(e.target.value)}
                      disabled={actionLoading}
                      className="w-full p-4 bg-red-50 border border-red-100 rounded-2xl text-sm focus:ring-2 focus:ring-red-500 outline-none h-32 disabled:opacity-60"
                      placeholder="Example: The ID image is blurry or expired..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsRejecting(false)}
                        disabled={actionLoading}
                        className="flex-1 py-3 text-sm font-bold text-slate-500 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReject(selectedResident.id)}
                        disabled={actionLoading}
                        className="flex-[2] py-3 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:bg-red-400"
                      >
                        {actionLoading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Rejecting...
                          </>
                        ) : (
                          "Confirm Reject"
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      Review the document on the left. Ensure the name on the ID
                      matches the registered name and that the document is still
                      valid.
                    </p>
                    {selectedResident?.status !== "Verified" && (
                      <div className="flex flex-col gap-2 pt-4">
                        <button
                          onClick={() => handleVerify(selectedResident.id)}
                          disabled={actionLoading}
                          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:bg-emerald-400"
                        >
                          {actionLoading ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={18} /> Approve Verification
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setIsRejecting(true)}
                          disabled={actionLoading}
                          className="w-full py-4 bg-white border border-slate-200 text-red-600 rounded-2xl font-black text-sm hover:bg-red-50 transition-all disabled:opacity-50 disabled:hover:bg-white"
                        >
                          Reject Document
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResidents;
