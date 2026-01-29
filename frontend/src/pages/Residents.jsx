import React, { useState, useMemo } from "react";
import {
  Search,
  MoreHorizontal,
  X,
  UserPlus,
  Edit2,
  Trash2,
  Key,
  ShieldAlert,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Download,
  FileCheck,
  AlertCircle,
  XCircle,
  Image as ImageIcon,
  Eye,
  Check,
} from "lucide-react";

const Residents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // MODAL STATES
  const [modalType, setModalType] = useState(null);
  const [selectedResident, setSelectedResident] = useState(null);

  const [residents, setResidents] = useState([
    {
      id: 1,
      name: "Maria Clara",
      email: "maria@example.com",
      status: "Verified",
      date: "Jan 12, 2026",
      avatar: "MC",
      idUrl: "https://via.placeholder.com/600x400?text=Valid+ID+Preview",
      verifiedDate: "Jan 13, 2026",
    },
    {
      id: 2,
      name: "Jose Rizal",
      email: "pepe@example.com",
      status: "Pending",
      date: "Jan 15, 2026",
      avatar: "JR",
      idUrl: "https://via.placeholder.com/600x400?text=Valid+ID+Preview",
      verifiedDate: null,
    },
    {
      id: 3,
      name: "Andres Bonifacio",
      email: "andres@example.com",
      status: "Verified",
      date: "Jan 18, 2026",
      avatar: "AB",
      idUrl: "https://via.placeholder.com/600x400?text=Valid+ID+Preview",
      verifiedDate: "Jan 19, 2026",
    },
    {
      id: 4,
      name: "Gabriela Silang",
      email: "gabriela@example.com",
      status: "Pending",
      date: "Jan 20, 2026",
      avatar: "GS",
      idUrl: "https://via.placeholder.com/600x400?text=Valid+ID+Preview",
      verifiedDate: null,
    },
    {
      id: 5,
      name: "Juan Luna",
      email: "juan@example.com",
      status: "Rejected",
      date: "Jan 22, 2026",
      avatar: "JL",
      idUrl: "https://via.placeholder.com/600x400?text=Valid+ID+Preview",
      rejectionReason: "ID image is blurry and unreadable",
      verifiedDate: null,
    },
  ]);

  // SEARCH & FILTER LOGIC
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

  // OPEN MODAL HELPER
  const openModal = (type, resident = null) => {
    setModalType(type);
    setSelectedResident(resident);
    setActiveMenu(null);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedResident(null);
  };

  // VERIFICATION ACTIONS
  const handleVerify = (residentId) => {
    setResidents((prev) =>
      prev.map((r) =>
        r.id === residentId
          ? {
              ...r,
              status: "Verified",
              verifiedDate: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            }
          : r,
      ),
    );
    closeModal();
  };

  const handleReject = (residentId, reason) => {
    setResidents((prev) =>
      prev.map((r) =>
        r.id === residentId
          ? { ...r, status: "Rejected", rejectionReason: reason }
          : r,
      ),
    );
    closeModal();
  };

  // Stats
  const stats = {
    total: residents.length,
    verified: residents.filter((r) => r.status === "Verified").length,
    pending: residents.filter((r) => r.status === "Pending").length,
    rejected: residents.filter((r) => r.status === "Rejected").length,
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Resident Management
        </h1>
        <p className="text-gray-500">Manage and verify registered residents</p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Total Residents
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {stats.total}
              </h3>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <UserPlus size={24} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Verified
              </p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {stats.verified}
              </h3>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <CheckCircle2 size={24} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFilterStatus("pending")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Pending Review
              </p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                {stats.pending}
              </h3>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Clock size={24} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Rejected
              </p>
              <h3 className="text-2xl font-black text-red-600 mt-1">
                {stats.rejected}
              </h3>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <XCircle size={24} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="Search by name or email..."
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
                onClick={() => setFilterStatus("verified")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === "verified"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Verified
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
                onClick={() => setFilterStatus("rejected")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === "rejected"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Rejected
              </button>
            </div>

            <button className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
              <Download size={18} className="text-gray-600" />
            </button>

            <button
              onClick={() => openModal("add")}
              className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 shadow-md whitespace-nowrap"
            >
              <UserPlus size={18} /> Add Resident
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm z-1">
        <div className="sm:overflow-auto md:overflow-none">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Resident
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Registered
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Search size={48} className="mb-3 opacity-50" />
                      <p className="font-semibold text-sm">
                        No residents found
                      </p>
                      <p className="text-xs mt-1">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredResidents.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md">
                          {r.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">
                            {r.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail size={14} className="text-gray-400" />
                        {r.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase ${
                          r.status === "Verified"
                            ? "bg-emerald-100 text-emerald-700"
                            : r.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {r.status === "Verified" ? (
                          <CheckCircle2 size={12} />
                        ) : r.status === "Rejected" ? (
                          <XCircle size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        {r.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center relative">
                      {r.status === "Pending" ? (
                        <button
                          onClick={() => openModal("verify", r)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-semibold text-sm shadow-md hover:shadow-lg mx-auto"
                        >
                          <FileCheck size={16} />
                          Review ID
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            setActiveMenu(activeMenu === r.id ? null : r.id)
                          }
                          className="bg-emerald-500 cursor-pointer hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-semibold text-sm shadow-md hover:shadow-lg mx-auto"
                        >
                          Actions
                        </button>
                      )}

                      {/* ACTION DROPDOWN */}
                      {activeMenu === r.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setActiveMenu(null)}
                          />
                          <div className="absolute -right-10 -top-25 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 z-[100] overflow-auto">
                            <div className="p-2 space-y-1">
                              {r.status === "Verified" && (
                                <button
                                  onClick={() => openModal("verify", r)}
                                  className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg flex items-center gap-3 transition-colors"
                                >
                                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <Eye
                                      size={16}
                                      className="text-emerald-600"
                                    />
                                  </div>
                                  <span>View ID</span>
                                </button>
                              )}
                              <button
                                onClick={() => openModal("edit", r)}
                                className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg flex items-center gap-3 transition-colors"
                              >
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Edit2 size={16} className="text-blue-600" />
                                </div>
                                <span>Edit Details</span>
                              </button>
                              <button
                                onClick={() => openModal("password", r)}
                                className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg flex items-center gap-3 transition-colors"
                              >
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                  <Key size={16} className="text-emerald-600" />
                                </div>
                                <span>Change Password</span>
                              </button>
                              <hr className="my-2 border-gray-100" />
                              <button
                                onClick={() => openModal("delete", r)}
                                className="w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-3 transition-colors"
                              >
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                  <Trash2 size={16} className="text-red-600" />
                                </div>
                                <span>Delete Resident</span>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL OVERLAY */}
      {modalType && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`bg-white rounded-2xl w-full shadow-2xl my-8 ${
              modalType === "verify" ? "max-w-3xl" : "max-w-md"
            }`}
          >
            {/* MODAL HEADER - Sticky */}
            <div className="sticky top-0 z-10 p-5 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-2xl">
              <h3 className="font-black text-gray-900 text-base flex items-center gap-3">
                {modalType === "verify" && (
                  <>
                    <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <FileCheck size={18} className="text-emerald-600" />
                    </div>
                    ID Verification
                  </>
                )}
                {modalType === "add" && (
                  <>
                    <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <UserPlus size={18} className="text-emerald-600" />
                    </div>
                    Add New Resident
                  </>
                )}
                {modalType === "edit" && (
                  <>
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Edit2 size={18} className="text-blue-600" />
                    </div>
                    Edit Resident
                  </>
                )}
                {modalType === "delete" && (
                  <>
                    <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                      <ShieldAlert size={18} className="text-red-600" />
                    </div>
                    Confirm Deletion
                  </>
                )}
                {modalType === "password" && (
                  <>
                    <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Key size={18} className="text-emerald-600" />
                    </div>
                    Reset Password
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

            {/* MODAL BODY - Scrollable */}
            <div className="p-5 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* ID VERIFICATION MODAL */}
              {modalType === "verify" && (
                <div className="space-y-4">
                  {/* Resident Info */}
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-black text-base shadow-md">
                        {selectedResident?.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">
                          {selectedResident?.name}
                        </h4>
                        <p className="text-xs text-gray-600 flex items-center gap-1.5 mt-0.5">
                          <Mail size={12} />
                          {selectedResident?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ID Image Preview */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-3 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon size={16} className="text-gray-500" />
                      <span className="font-bold text-gray-700 text-xs">
                        Submitted Valid ID
                      </span>
                    </div>
                    <div className="bg-white rounded-lg overflow-hidden shadow-md">
                      <img
                        src={selectedResident?.idUrl}
                        alt="Valid ID"
                        className="w-full h-64 object-contain"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 text-center">
                      Verify that the ID matches the resident's information
                    </p>
                  </div>

                  {/* Rejection Reason (if rejected before) */}
                  {selectedResident?.status === "Rejected" &&
                    selectedResident?.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle
                            size={16}
                            className="text-red-600 mt-0.5 flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-red-900 text-xs">
                              Previously Rejected
                            </p>
                            <p className="text-xs text-red-700 mt-1">
                              {selectedResident.rejectionReason}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Verified Status */}
                  {selectedResident?.status === "Verified" && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          size={18}
                          className="text-emerald-600 flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-emerald-900 text-xs">
                            Verified Resident
                          </p>
                          <p className="text-xs text-emerald-700 mt-0.5">
                            Verified on {selectedResident.verifiedDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(modalType === "add" || modalType === "edit") && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">
                      Full Name
                    </label>
                    <input
                      defaultValue={selectedResident?.name}
                      type="text"
                      placeholder="Enter full name"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white outline-none focus:border-emerald-500 transition-all font-medium text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">
                      Email Address
                    </label>
                    <input
                      defaultValue={selectedResident?.email}
                      type="email"
                      placeholder="email@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white outline-none focus:border-emerald-500 transition-all font-medium text-sm"
                    />
                  </div>
                  {modalType === "add" && (
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">
                        Initial Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white outline-none focus:border-emerald-500 transition-all font-medium text-sm"
                      />
                    </div>
                  )}
                </div>
              )}

              {modalType === "password" && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium">
                      Updating password for
                    </p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {selectedResident?.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white outline-none focus:border-emerald-500 transition-all font-medium text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white outline-none focus:border-emerald-500 transition-all font-medium text-sm"
                    />
                  </div>
                </div>
              )}

              {modalType === "delete" && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <ShieldAlert size={32} strokeWidth={2} />
                  </div>
                  <p className="text-base font-bold text-gray-900 mb-2">
                    Are you absolutely sure?
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    This will permanently delete{" "}
                    <span className="font-bold text-gray-900">
                      {selectedResident?.name}
                    </span>{" "}
                    and all associated records. This action cannot be undone.
                  </p>
                </div>
              )}
            </div>

            {/* MODAL FOOTER - Sticky */}
            <div className="sticky bottom-0 p-5 border-t border-gray-200 bg-white rounded-b-2xl">
              {modalType === "verify" &&
              selectedResident?.status !== "Verified" ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const reason = prompt(
                        "Enter rejection reason (required):",
                      );
                      if (reason && reason.trim()) {
                        handleReject(selectedResident.id, reason);
                      }
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl font-bold text-red-700 bg-red-100 hover:bg-red-200 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleVerify(selectedResident.id)}
                    className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 transition-all text-sm shadow-lg hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    Approve
                  </button>
                </div>
              ) : modalType !== "verify" ? (
                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-white transition-all text-sm shadow-lg hover:scale-105 ${
                      modalType === "delete"
                        ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                        : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                    }`}
                  >
                    {modalType === "delete"
                      ? "Delete Forever"
                      : modalType === "password"
                        ? "Update Password"
                        : "Save Changes"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={closeModal}
                  className="w-full px-4 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all text-sm"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Residents;
