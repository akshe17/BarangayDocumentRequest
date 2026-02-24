import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ArrowLeft,
  Edit2,
  Trash2,
  RefreshCw,
  User,
  ShieldCheck,
  Save,
  Eye,
  EyeOff,
  UserX,
  UserCheck,
  AlertTriangle,
  ChevronRight,
  Mail,
  Calendar,
  MapPin,
} from "lucide-react";
import api from "../../axious/api";

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENT: RESIDENT EDIT & SECURITY
   ───────────────────────────────────────────────────────────── */
const ResidentEditView = ({ userId, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState({
    zones: [],
    genders: [],
    civil_statuses: [],
  });

  // FIX: Added 'is_verified' and 'house_no' to match Laravel validation
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    zone_id: "",
    gender_id: "",
    civil_status_id: "",
    birthdate: "",
    is_active: true,
    is_verified: false,
    house_no: "",
  });

  const [passwordData, setPasswordData] = useState({
    password: "",
    password_confirmation: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [message, setMessage] = useState(null);

  const initData = useCallback(async () => {
    setLoading(true);
    try {
      const [metaRes, userRes] = await Promise.all([
        api.get("/admin/residents/meta"),
        api.get(`/admin/residents/${userId}`),
      ]);
      setMeta(metaRes.data);
      const u = userRes.data;

      // Map API response to match Laravel's expected $data keys
      setFormData({
        first_name: u.first_name || "",
        last_name: u.last_name || "",
        email: u.email || "",
        zone_id: u.zone_id || "",
        gender_id: u.resident?.gender_id || "",
        civil_status_id: u.resident?.civil_status_id || "",
        birthdate: u.resident?.birthdate || "",
        house_no: u.resident?.house_no || "",
        is_active: u.is_active == 1,
        is_verified: u.resident?.is_verified == 1,
      });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load data." });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    initData();
  }, [initData]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      // Logic: Laravel expects booleans for is_active and is_verified
      await api.patch(`/admin/residents/${userId}`, formData);
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      // Capture Laravel validation errors if any
      const errorMsg = err.response?.data?.message || "Update failed.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = !formData.is_active;
    if (
      !window.confirm(
        `Change account access to ${newStatus ? "Active" : "Disabled"}?`,
      )
    )
      return;
    try {
      // We use the full update route here since your controller handles is_active in update()
      const updatedData = { ...formData, is_active: newStatus };
      await api.patch(`/admin/residents/${userId}`, updatedData);
      setFormData(updatedData);
      setMessage({ type: "success", text: "Account status updated." });
    } catch (err) {
      setMessage({ type: "error", text: "Action failed." });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.password_confirmation) {
      return setMessage({ type: "error", text: "Passwords do not match." });
    }
    setSaving(true);
    try {
      // FIX: Key must be 'password_confirmation' for Laravel's 'confirmed' rule
      await api.patch(`/admin/residents/${userId}/password`, passwordData);
      setPasswordData({ password: "", password_confirmation: "" });
      setMessage({ type: "success", text: "Password changed successfully." });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Password update failed. (Requires 8 chars, mixed case, numbers)";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-emerald-500 mb-2" size={24} />
        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          Loading Resident
        </span>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Mini Header */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              {formData.first_name} {formData.last_name}
            </h2>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">
              Edit Resident Details
            </p>
          </div>
        </div>
        <button
          onClick={handleToggleStatus}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all ${formData.is_active ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}
        >
          {formData.is_active ? <UserX size={12} /> : <UserCheck size={12} />}
          {formData.is_active ? "Disable Account" : "Enable Account"}
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg flex items-center gap-2 text-[11px] font-bold ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
        >
          <AlertTriangle size={14} /> {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          onSubmit={handleUpdateProfile}
          className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <User size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Personal Profile
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                First Name
              </label>
              <input
                required
                className="w-full px-3 py-2 bg-slate-50 border border-transparent focus:border-emerald-500/20 focus:bg-white rounded-lg text-xs outline-none transition-all"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                Last Name
              </label>
              <input
                required
                className="w-full px-3 py-2 bg-slate-50 border border-transparent focus:border-emerald-500/20 focus:bg-white rounded-lg text-xs outline-none transition-all"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-transparent focus:border-emerald-500/20 focus:bg-white rounded-lg text-xs outline-none transition-all"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                Zone
              </label>
              <select
                className="w-full px-3 py-2 bg-slate-50 border border-transparent focus:border-emerald-500/20 focus:bg-white rounded-lg text-xs outline-none transition-all"
                value={formData.zone_id}
                onChange={(e) =>
                  setFormData({ ...formData, zone_id: e.target.value })
                }
              >
                <option value="">Select Zone</option>
                {meta.zones.map((z) => (
                  <option key={z.zone_id} value={z.zone_id}>
                    {z.zone_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                Birthdate
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-slate-50 border border-transparent focus:border-emerald-500/20 focus:bg-white rounded-lg text-xs outline-none transition-all"
                value={formData.birthdate}
                onChange={(e) =>
                  setFormData({ ...formData, birthdate: e.target.value })
                }
              />
            </div>
            {/* Added Verification Checkbox for Laravel Validation */}
            <div className="col-span-2 py-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-200 text-emerald-600 focus:ring-emerald-500"
                  checked={formData.is_verified}
                  onChange={(e) =>
                    setFormData({ ...formData, is_verified: e.target.checked })
                  }
                />
                <span className="text-[11px] font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">
                  Mark Resident as Verified
                </span>
              </label>
            </div>
          </div>
          <button
            disabled={saving}
            className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-sm"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}{" "}
            Save Profile Changes
          </button>
        </form>

        <form
          onSubmit={handleChangePassword}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Security
            </span>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-transparent focus:border-emerald-500/20 focus:bg-white rounded-lg text-xs outline-none transition-all"
                  value={passwordData.password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      password: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                  <Eye size={14} />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                Confirm Password
              </label>
              <input
                type="password"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-transparent focus:border-emerald-500/20 focus:bg-white rounded-lg text-xs outline-none transition-all"
                value={passwordData.password_confirmation}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    password_confirmation: e.target.value,
                  })
                }
              />
            </div>
            <button
              disabled={saving}
              className="w-full py-2 bg-emerald-50 text-emerald-600 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-emerald-100 transition-all"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT: RESIDENT MANAGEMENT
   ───────────────────────────────────────────────────────────── */
const ResidentManagement = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [view, setView] = useState({ type: "list", userId: null });

  const fetchResidents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/residents");
      setResidents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  const filtered = useMemo(() => {
    return residents.filter((u) => {
      const isVerified = u.resident?.is_verified;
      const label =
        isVerified == 1 ? "Verified" : isVerified == 0 ? "Rejected" : "Pending";
      const q = searchQuery.toLowerCase();
      const name = `${u.first_name} ${u.last_name}`.toLowerCase();
      const matchStatus = statusFilter === "All" || label === statusFilter;
      return (
        matchStatus &&
        (name.includes(q) || (u.email || "").toLowerCase().includes(q))
      );
    });
  }, [residents, searchQuery, statusFilter]);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure? This will permanently delete this resident record.",
      )
    )
      return;
    try {
      await api.delete(`/admin/residents/${id}`);
      fetchResidents();
    } catch (err) {
      alert("Delete failed.");
    }
  };

  if (view.type === "edit") {
    return (
      <div className="max-w-5xl mx-auto p-6 min-h-screen bg-slate-50/50">
        <ResidentEditView
          userId={view.userId}
          onBack={() => {
            setView({ type: "list" });
            fetchResidents();
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans text-slate-900 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-800">
            Resident Directory
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {filtered.length} Records Found
            </p>
          </div>
        </div>
        <button
          onClick={fetchResidents}
          className="p-2.5 bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-emerald-500 rounded-xl transition-all"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
            size={14}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500/5 transition-all shadow-sm"
          />
        </div>
        <div className="flex bg-white border border-slate-100 p-1 rounded-xl shadow-sm">
          {["All", "Verified", "Pending"].map((t) => (
            <button
              key={t}
              onClick={() => setStatusFilter(t)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${statusFilter === t ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Resident Details
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">
                Zone
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">
                Account
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="4" className="py-20 text-center">
                  <Loader2
                    className="animate-spin mx-auto text-emerald-500"
                    size={24}
                  />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="py-20 text-center text-xs text-slate-400 font-bold uppercase tracking-widest"
                >
                  No residents found
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr
                  key={u.user_id}
                  className="hover:bg-slate-50/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        {u.first_name?.[0]}
                        {u.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">
                          {u.first_name} {u.last_name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      {u.zone?.zone_name || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {u.is_active ? (
                        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-tighter">
                          <UserCheck size={10} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-black text-rose-400 bg-rose-50 px-2 py-1 rounded-md uppercase tracking-tighter">
                          <UserX size={10} /> Disabled
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          setView({ type: "edit", userId: u.user_id })
                        }
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(u.user_id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
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
  );
};

export default ResidentManagement;
