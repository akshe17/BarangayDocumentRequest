import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Loader2,
  ArrowLeft,
  Edit3,
  RefreshCw,
  User,
  ShieldCheck,
  Save,
  Eye,
  EyeOff,
  UserX,
  UserCheck,
  Clock,
  ChevronRight,
  MapPin,
  Mail,
  Hash,
  Calendar,
  AlertTriangle,
  Lock,
  Users,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import api from "../../axious/api";
import { useAdminResidents } from "../../context/AdminResidentContext";
import Toast from "../../components/toast";
/* ─────────────────────────────────────────────────────────────
   HELPERS & SHARED UI
   ───────────────────────────────────────────────────────────── */
const getVerificationInfo = (isVerified, isActive) => {
  if (isActive == 0 || isActive === false)
    return {
      label: "Disabled",
      color: "text-slate-500",
      bg: "bg-slate-100",
      dot: "bg-slate-400",
      pill: "bg-slate-100 text-slate-500 border-slate-200",
    };
  if (isVerified == 1)
    return {
      label: "Verified",
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      dot: "bg-emerald-500",
      pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  if (isVerified == 0)
    return {
      label: "Rejected",
      color: "text-rose-700",
      bg: "bg-rose-50",
      dot: "bg-rose-500",
      pill: "bg-rose-50 text-rose-700 border-rose-200",
    };
  return {
    label: "Pending",
    color: "text-amber-700",
    bg: "bg-amber-50",
    dot: "bg-amber-400",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
  };
};

const StatusPill = ({ isVerified, isActive }) => {
  const info = getVerificationInfo(isVerified, isActive);
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${info.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`} />
      {info.label}
    </span>
  );
};

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
      <Icon size={16} className="text-white" />
    </div>
    <div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {subtitle && (
        <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
      )}
    </div>
  </div>
);

const FieldLabel = ({ children }) => (
  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
    {children}
  </label>
);

const inputCls =
  "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition-colors placeholder:text-slate-300";

const selectCls =
  "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition-colors";

/* ─────────────────────────────────────────────────────────────
   RESIDENT PROFILE HEADER (shared across sub-pages)
   ───────────────────────────────────────────────────────────── */
const ResidentProfileCard = ({ resident, activeTab, onTabChange }) => {
  const info = getVerificationInfo(
    resident?.resident?.is_verified,
    resident?.is_active,
  );
  const initials = `${resident?.first_name?.[0] || ""}${resident?.last_name?.[0] || ""}`;

  const tabs = [
    { id: "details", label: "Details", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "account", label: "Account", icon: ToggleLeft },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mb-6">
      {/* Top strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 via-slate-600 to-slate-400" />
      <div className="px-6 pt-5 pb-0">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white text-lg font-black shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black text-slate-900">
                {resident?.first_name} {resident?.last_name}
              </h2>
              <StatusPill
                isVerified={resident?.resident?.is_verified}
                isActive={resident?.is_active}
              />
            </div>
            <div className="flex items-center gap-4 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Mail size={10} /> {resident?.email}
              </span>
              {resident?.zone?.zone_name && (
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin size={10} /> {resident.zone.zone_name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0 border-t border-slate-100">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex items-center gap-1.5 px-5 py-3 text-[11px] font-black uppercase tracking-wider border-b-2 transition-all
                ${
                  activeTab === id
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   TAB: EDIT DETAILS
   ───────────────────────────────────────────────────────────── */
const EditDetailsTab = ({ userId, onToast }) => {
  const { residents, meta, metaLoading, updateResidentInState } =
    useAdminResidents();
  const [saving, setSaving] = useState(false);

  const residentData = useMemo(
    () => residents.find((r) => r.user_id === userId),
    [residents, userId],
  );

  const [form, setForm] = useState({
    first_name: residentData?.first_name || "",
    last_name: residentData?.last_name || "",
    email: residentData?.email || "",
    zone_id: residentData?.zone_id || "",
    gender_id: residentData?.resident?.gender_id || "",
    civil_status_id: residentData?.resident?.civil_status_id || "",
    birthdate: residentData?.resident?.birthdate || "",
    house_no: residentData?.resident?.house_no || "",
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch(`/admin/residents/${userId}`, form);
      updateResidentInState(userId, res.data.user);
      onToast({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      onToast({
        type: "error",
        text: err.response?.data?.message || "Update failed.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (metaLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={22} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <SectionHeader
        icon={User}
        title="Personal Information"
        subtitle="Update the resident's basic profile details"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>First Name</FieldLabel>
          <input
            required
            className={inputCls}
            placeholder="First name"
            value={form.first_name}
            onChange={set("first_name")}
          />
        </div>
        <div>
          <FieldLabel>Last Name</FieldLabel>
          <input
            required
            className={inputCls}
            placeholder="Last name"
            value={form.last_name}
            onChange={set("last_name")}
          />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel>Email Address</FieldLabel>
          <input
            type="email"
            className={inputCls}
            placeholder="Email address"
            value={form.email}
            onChange={set("email")}
          />
        </div>
        <div>
          <FieldLabel>House No.</FieldLabel>
          <input
            className={inputCls}
            placeholder="House number"
            value={form.house_no}
            onChange={set("house_no")}
          />
        </div>
        <div>
          <FieldLabel>Date of Birth</FieldLabel>
          <input
            type="date"
            className={inputCls}
            value={form.birthdate}
            onChange={set("birthdate")}
          />
        </div>
        <div>
          <FieldLabel>Zone</FieldLabel>
          <select
            className={selectCls}
            value={form.zone_id}
            onChange={set("zone_id")}
          >
            <option value="">Select zone</option>
            {meta.zones.map((z) => (
              <option key={z.zone_id} value={z.zone_id}>
                {z.zone_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>Gender</FieldLabel>
          <select
            className={selectCls}
            value={form.gender_id}
            onChange={set("gender_id")}
          >
            <option value="">Select gender</option>
            {meta.genders.map((g) => (
              <option key={g.gender_id} value={g.gender_id}>
                {g.gender_name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <FieldLabel>Civil Status</FieldLabel>
          <select
            className={selectCls}
            value={form.civil_status_id}
            onChange={set("civil_status_id")}
          >
            <option value="">Select civil status</option>
            {meta.civil_statuses.map((cs) => (
              <option key={cs.civil_status_id} value={cs.civil_status_id}>
                {cs.civil_status_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Save size={13} />
          )}
          Save Changes
        </button>
      </div>
    </form>
  );
};

/* ─────────────────────────────────────────────────────────────
   TAB: CHANGE PASSWORD
   ───────────────────────────────────────────────────────────── */
const ChangePasswordTab = ({ userId, onToast }) => {
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    password: "",
    password_confirmation: "",
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = [
    "",
    "bg-rose-400",
    "bg-amber-400",
    "bg-blue-400",
    "bg-emerald-500",
  ][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      return onToast({ type: "error", text: "Passwords do not match." });
    }
    setSaving(true);
    try {
      await api.patch(`/admin/residents/${userId}/password`, form);
      setForm({ password: "", password_confirmation: "" });
      onToast({ type: "success", text: "Password updated successfully." });
    } catch (err) {
      onToast({
        type: "error",
        text: err.response?.data?.message || "Password update failed.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
      <SectionHeader
        icon={ShieldCheck}
        title="Change Password"
        subtitle="Set a new password for this resident's account"
      />

      <div>
        <FieldLabel>New Password</FieldLabel>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            required
            className={`${inputCls} pr-10`}
            placeholder="Enter new password"
            value={form.password}
            onChange={set("password")}
          />
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        {/* Strength meter */}
        {form.password && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : "bg-slate-100"}`}
                />
              ))}
            </div>
            <p
              className={`text-[10px] font-bold ${["", "text-rose-500", "text-amber-500", "text-blue-500", "text-emerald-600"][strength]}`}
            >
              {strengthLabel}
            </p>
          </div>
        )}
      </div>

      <div>
        <FieldLabel>Confirm Password</FieldLabel>
        <input
          type={showPass ? "text" : "password"}
          required
          className={`${inputCls} ${form.password_confirmation && form.password !== form.password_confirmation ? "border-rose-300 bg-rose-50/40" : ""}`}
          placeholder="Confirm new password"
          value={form.password_confirmation}
          onChange={set("password_confirmation")}
        />
        {form.password_confirmation &&
          form.password !== form.password_confirmation && (
            <p className="mt-1 text-[10px] text-rose-500 font-medium">
              Passwords do not match
            </p>
          )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Lock size={13} />
          )}
          Update Password
        </button>
      </div>
    </form>
  );
};

/* ─────────────────────────────────────────────────────────────
   TAB: ACCOUNT STATUS (disable/enable)
   ───────────────────────────────────────────────────────────── */
const AccountStatusTab = ({ userId, onToast }) => {
  const { residents, updateResidentInState } = useAdminResidents();
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const resident = useMemo(
    () => residents.find((r) => r.user_id === userId),
    [residents, userId],
  );

  const isActive = resident?.is_active == 1;

  const handleToggle = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/admin/residents/${userId}/toggle-active`);
      updateResidentInState(userId, res.data.user);
      onToast({
        type: "success",
        text: res.data.message,
      });
      setConfirming(false);
    } catch (err) {
      onToast({ type: "error", text: "Failed to update account status." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <SectionHeader
        icon={isActive ? ToggleRight : ToggleLeft}
        title="Account Status"
        subtitle="Control whether this resident can access the system"
      />

      {/* Status card */}
      <div
        className={`rounded-2xl border p-5 flex items-center gap-4 transition-all ${isActive ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}
      >
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${isActive ? "bg-emerald-500" : "bg-slate-300"}`}
        >
          {isActive ? (
            <UserCheck size={20} className="text-white" />
          ) : (
            <UserX size={20} className="text-white" />
          )}
        </div>
        <div>
          <p
            className={`text-sm font-black ${isActive ? "text-emerald-800" : "text-slate-600"}`}
          >
            Account is currently {isActive ? "Active" : "Disabled"}
          </p>
          <p
            className={`text-[11px] mt-0.5 ${isActive ? "text-emerald-600" : "text-slate-400"}`}
          >
            {isActive
              ? "This resident can log in and use the system."
              : "This resident is blocked from accessing the system."}
          </p>
        </div>
      </div>

      {/* Confirmation / action */}
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all
            ${
              isActive
                ? "border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100"
                : "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
            }`}
        >
          {isActive ? (
            <>
              <UserX size={13} /> Disable Account
            </>
          ) : (
            <>
              <UserCheck size={13} /> Enable Account
            </>
          )}
        </button>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle
              size={14}
              className="text-amber-600 mt-0.5 shrink-0"
            />
            <p className="text-xs text-amber-800 font-medium">
              {isActive
                ? "Are you sure you want to disable this account? The resident will lose access immediately."
                : "Are you sure you want to re-enable this account? The resident will regain access."}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleToggle}
              disabled={saving}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider text-white transition-colors disabled:opacity-50
                ${isActive ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600"}`}
            >
              {saving ? <Loader2 size={11} className="animate-spin" /> : null}
              {isActive ? "Yes, Disable" : "Yes, Enable"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   RESIDENT EDIT PAGE (orchestrates tabs)
   ───────────────────────────────────────────────────────────── */
const ResidentEditPage = ({ userId, onBack }) => {
  const { residents } = useAdminResidents();
  const [activeTab, setActiveTab] = useState("details");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = ({ type, text }) =>
    setToast({ show: true, message: text, type });

  const closeToast = () => setToast((prev) => ({ ...prev, show: false }));

  const resident = useMemo(
    () => residents.find((r) => r.user_id === userId),
    [residents, userId],
  );

  return (
    <div className="min-h-screen bg-slate-50/60 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Back nav */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-700 mb-5 transition-colors group"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Residents
        </button>

        <ResidentProfileCard
          resident={resident}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab content panel */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
          {activeTab === "details" && (
            <EditDetailsTab userId={userId} onToast={showToast} />
          )}
          {activeTab === "password" && (
            <ChangePasswordTab userId={userId} onToast={showToast} />
          )}
          {activeTab === "account" && (
            <AccountStatusTab userId={userId} onToast={showToast} />
          )}
        </div>
      </div>

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN: RESIDENT MANAGEMENT LIST
   ───────────────────────────────────────────────────────────── */
const FILTERS = ["All", "Verified", "Pending", "Rejected", "Disabled"];

const ResidentManagement = () => {
  const { residents, loading, fetchResidents } = useAdminResidents();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [view, setView] = useState({ type: "list", userId: null });

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  const filtered = useMemo(() => {
    return residents.filter((u) => {
      const { label } = getVerificationInfo(
        u.resident?.is_verified,
        u.is_active,
      );
      const q = searchQuery.toLowerCase();
      const name = `${u.first_name} ${u.last_name}`.toLowerCase();
      const matchStatus = statusFilter === "All" || label === statusFilter;
      const matchSearch =
        name.includes(q) || (u.email || "").toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [residents, searchQuery, statusFilter]);

  // Counts per filter
  const counts = useMemo(() => {
    const c = { All: residents.length };
    residents.forEach((u) => {
      const { label } = getVerificationInfo(
        u.resident?.is_verified,
        u.is_active,
      );
      c[label] = (c[label] || 0) + 1;
    });
    return c;
  }, [residents]);

  if (view.type === "edit") {
    return (
      <ResidentEditPage
        userId={view.userId}
        onBack={() => setView({ type: "list" })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
                <Users size={14} className="text-white" />
              </div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                Residents
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-medium ml-10.5">
              {filtered.length} of {residents.length} residents shown
            </p>
          </div>
          <button
            onClick={() => fetchResidents(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 hover:border-slate-300 shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300"
              size={14}
            />
            <input
              type="text"
              placeholder="Search by name or email…"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none shadow-sm focus:border-slate-400 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-1.5 bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`relative px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all
                  ${
                    statusFilter === f
                      ? "bg-emerald-500 text-white shadow"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
              >
                {f}
                {counts[f] !== undefined && (
                  <span
                    className={`ml-1.5 text-[9px] font-black ${statusFilter === f ? "opacity-70" : "opacity-50"}`}
                  >
                    {counts[f]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 size={24} className="animate-spin text-slate-300" />
              <p className="text-xs text-slate-400 font-medium">
                Loading residents…
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-1">
                <Users size={20} className="text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400">
                No residents found
              </p>
              <p className="text-xs text-slate-300">
                Try adjusting your search or filter
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Resident
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center hidden sm:table-cell">
                    Zone
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const info = getVerificationInfo(
                    u.resident?.is_verified,
                    u.is_active,
                  );
                  return (
                    <tr
                      key={u.user_id}
                      className={`group transition-colors hover:bg-slate-50/70 ${i !== filtered.length - 1 ? "border-b border-slate-50" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black transition-colors
                              ${
                                u.is_active == 0
                                  ? "bg-slate-100 text-slate-400"
                                  : "bg-emerald-500 text-white group-hover:bg-slate-700"
                              }`}
                          >
                            {u.first_name?.[0]}
                            {u.last_name?.[0]}
                          </div>
                          <div>
                            <p
                              className={`text-xs font-bold ${u.is_active == 0 ? "text-slate-400" : "text-slate-800"}`}
                            >
                              {u.first_name} {u.last_name}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <MapPin size={9} />
                          {u.zone?.zone_name || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusPill
                          isVerified={u.resident?.is_verified}
                          isActive={u.is_active}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            setView({ type: "edit", userId: u.user_id })
                          }
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border border-slate-200 text-white bg-emerald-500 hover:bg-slate-700 hover:text-white cursor-pointer transition-all shadow-sm group/btn"
                        >
                          <Edit3 size={11} />
                          Manage
                          <ChevronRight
                            size={10}
                            className="opacity-40 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all"
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <p className="text-center text-[10px] text-slate-300 font-medium mt-4">
            Showing {filtered.length} resident{filtered.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResidentManagement;
