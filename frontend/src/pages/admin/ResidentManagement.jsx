import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  UserPlus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  AlertTriangle,
  Filter,
} from "lucide-react";
import api from "../../axious/api";

const ResidentManagement = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
  }, []);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/residents");
      setResidents(
        response.data.map((u) => ({
          id: u.user_id,
          name: `${u.first_name} ${u.last_name}`,
          email: u.email,
          zone: u.zone?.zone_name || "N/A",
          house_no: u.resident?.house_no || "N/A",
          is_verified: u.resident?.is_verified,
        })),
      );
    } catch (error) {
      showToast("Error loading database", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  const handleVerify = async (id, status) => {
    try {
      await api.put(`/admin/residents/${id}/verify`, { status });
      showToast(`Resident ${status ? "Verified" : "Rejected"}`);
      setModalType(null);
      fetchResidents();
    } catch (error) {
      showToast("Update failed", "error");
    }
  };

  const getStatusUI = (status) => {
    if (status === true)
      return {
        label: "Verified",
        color: "bg-emerald-100 text-emerald-700 border-emerald-200",
        icon: <CheckCircle2 size={14} />,
      };
    if (status === false)
      return {
        label: "Rejected",
        color: "bg-red-100 text-red-700 border-red-200",
        icon: <XCircle size={14} />,
      };
    return {
      label: "Pending",
      color: "bg-amber-100 text-amber-700 border-amber-200",
      icon: <Clock size={14} />,
    };
  };

  const filteredData = residents.filter((r) => {
    const status = getStatusUI(r.is_verified).label;
    const matchesFilter = statusFilter === "All" || status === statusFilter;
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50 font-sans">
      {/* TOAST */}
      {toast.show && (
        <div
          className={`fixed top-10 right-10 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-bounce ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          <CheckCircle2 size={20} />{" "}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Resident Records
          </h1>
          <p className="text-emerald-600 font-semibold flex items-center gap-2 mt-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            System Administrator Dashboard
          </p>
        </div>
        <button
          onClick={() => setModalType("add")}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 active:scale-95"
        >
          <UserPlus size={22} /> Register Resident
        </button>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search residents by name or email..."
            className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none transition-all shadow-sm font-medium"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border-2 border-slate-100">
          {["All", "Verified", "Pending"].map((t) => (
            <button
              key={t}
              onClick={() => setStatusFilter(t)}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all ${statusFilter === t ? "bg-emerald-500 text-white shadow-md" : "text-slate-400 hover:text-emerald-500"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-40 flex flex-col items-center text-emerald-500">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="font-bold tracking-widest uppercase">
              Loading Database...
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b-2 border-slate-100">
              <tr>
                <th className="px-8 py-6 text-xs font-black uppercase text-slate-400 tracking-widest">
                  Resident
                </th>
                <th className="px-8 py-6 text-xs font-black uppercase text-slate-400 tracking-widest">
                  Address
                </th>
                <th className="px-8 py-6 text-xs font-black uppercase text-slate-400 tracking-widest">
                  Status
                </th>
                <th className="px-8 py-6 text-xs font-black uppercase text-slate-400 tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {filteredData.map((res) => {
                const ui = getStatusUI(res.is_verified);
                return (
                  <tr
                    key={res.id}
                    className="hover:bg-emerald-50/30 transition-all group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-100">
                          {res.name[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg">
                            {res.name}
                          </p>
                          <p className="text-slate-400 font-medium">
                            {res.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-700">{res.zone}</p>
                      <p className="text-sm text-slate-400 font-medium">
                        House #{res.house_no}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase border-2 flex items-center gap-2 w-fit ${ui.color}`}
                      >
                        {ui.icon} {ui.label}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => {
                            setCurrentUser(res);
                            setModalType("edit");
                          }}
                          className="p-3 bg-slate-50 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setCurrentUser(res);
                            setModalType("delete");
                          }}
                          className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* VERIFICATION MODAL */}
      {modalType === "edit" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-slate-900 mb-2 text-center">
              Verification
            </h2>
            <p className="text-slate-500 text-center mb-8">
              Update account status for <br />
              <span className="text-emerald-600 font-bold">
                {currentUser.name}
              </span>
            </p>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => handleVerify(currentUser.id, true)}
                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 /> Verify Resident
              </button>
              <button
                onClick={() => handleVerify(currentUser.id, false)}
                className="w-full py-4 bg-white border-2 border-red-100 text-red-500 rounded-2xl font-black hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                <XCircle /> Reject Account
              </button>
              <button
                onClick={() => setModalType(null)}
                className="mt-4 text-slate-400 font-bold hover:text-slate-600"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentManagement;
