import React, { useState, useCallback, useEffect } from "react";
import {
  Search,
  UserPlus,
  ShieldCheck,
  Edit2,
  KeyRound,
  Trash2,
  AlertTriangle,
  X,
  RefreshCw,
  MapPin,
  Home,
  Eye,
  EyeOff,
  Check,
  ChevronRight,
  Users,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import {
  UserManagementProvider,
  useUserManagement,
} from "../../context/UserManagementContext";
import { useZones } from "../../context/ZoneContext";
import Toast from "../../components/toast";
import Skeleton from "../../components/Skeleton";

/* ─── Constants ──────────────────────────────────────────────── */
const ROLES = ["All", "Admin", "Clerk", "Zone Leader"];
const ROLE_OPTIONS = ["Admin", "Clerk", "Zone Leader"];

const roleColors = {
  Admin: "bg-purple-100 text-purple-700 border-purple-200",
  Clerk: "bg-blue-100 text-blue-700 border-blue-200",
  "Zone Leader": "bg-amber-100 text-amber-700 border-amber-200",
};

const roleAccent = {
  Admin: "from-purple-500 to-purple-700",
  Clerk: "from-blue-500 to-blue-700",
  "Zone Leader": "from-amber-500 to-amber-600",
  "Barangay Captain": "from-emerald-500 to-emerald-700",
};

/* ─── Skeleton ───────────────────────────────────────────────── */
const UserTableSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="flex gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50">
      {["w-36", "w-52", "w-28", "w-20 ml-auto"].map((w, i) => (
        <Skeleton.Block key={i} className={`h-3 ${w}`} />
      ))}
    </div>
    {Array.from({ length: 7 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0"
      >
        <div className="flex items-center gap-3 flex-1">
          <Skeleton.Circle size="w-10 h-10" />
          <div className="space-y-1.5">
            <Skeleton.Block className="w-36 h-3" />
            <Skeleton.Block className="w-24 h-2.5" />
          </div>
        </div>
        <Skeleton.Block className="hidden sm:block w-48 h-3" />
        <Skeleton.Block className="w-24 h-6 rounded-full" />
        <div className="flex gap-2 ml-auto">
          {[0, 1, 2].map((j) => (
            <Skeleton.Block key={j} className="w-8 h-8 rounded-lg" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

/* ─── Password strength ──────────────────────────────────────── */
const calcStrength = (pw) => {
  let s = 0;
  if (pw.length >= 8) s += 25;
  if (pw.length >= 12) s += 25;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s += 25;
  if (/[0-9]/.test(pw)) s += 15;
  if (/[^a-zA-Z0-9]/.test(pw)) s += 10;
  return Math.min(s, 100);
};

/* ─── Shared field component ─────────────────────────────────── */
const Field = ({ label, icon: Icon, children, required }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          size={16}
        />
      )}
      {children}
    </div>
  </div>
);

const inputClass = (hasIcon = true) =>
  `w-full ${hasIcon ? "pl-10" : "pl-4"} pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none`;

/* ─── ADD / EDIT FORM PANEL ──────────────────────────────────── */
const UserForm = ({ mode, user, onSubmit, onCancel, submitting }) => {
  const { zones, loadingZones } = useZones();
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role_name: "Clerk",
    zone_id: "",
    house_no: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    if (isEdit && user) {
      const zoneId = user.zone_leader?.zone_id ?? "";
      setForm({
        first_name: user.first_name ?? "",
        middle_name: user.middle_name ?? "",
        last_name: user.last_name ?? "",
        email: user.email ?? "",
        password: "",
        password_confirmation: "",
        role_name:
          user.role?.role_name ??
          user.role_name ??
          (typeof user.role === "string" ? user.role : null) ??
          "Clerk",
        zone_id: zoneId,
        house_no: user.zone_leader?.house_no ?? "",
      });
    } else {
      setForm({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role_name: "Clerk",
        zone_id: "",
        house_no: "",
      });
    }
    setStrength(0);
  }, [user, isEdit, mode]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const isZL = form.role_name === "Zone Leader";

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Panel header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
        <button
          onClick={onCancel}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-base font-bold text-gray-900">
            {isEdit ? "Edit User" : "Add New User"}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEdit
              ? `Editing ${user?.first_name} ${user?.last_name}`
              : "Fill in the details to create a new account"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Name row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="First Name" required>
            <input
              className={inputClass(false)}
              value={form.first_name}
              onChange={(e) => set("first_name", e.target.value)}
              required
              placeholder="Juan"
            />
          </Field>
          <Field label="Middle Name">
            <input
              className={inputClass(false)}
              value={form.middle_name}
              onChange={(e) => set("middle_name", e.target.value)}
              placeholder="(optional)"
            />
          </Field>
          <Field label="Last Name" required>
            <input
              className={inputClass(false)}
              value={form.last_name}
              onChange={(e) => set("last_name", e.target.value)}
              required
              placeholder="dela Cruz"
            />
          </Field>
        </div>

        {/* Email */}
        <Field label="Email Address" required>
          <input
            type="email"
            className={inputClass(false)}
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
            placeholder="user@barangay.gov.ph"
          />
        </Field>

        {/* Role */}
        <Field label="Role" required>
          <select
            className={inputClass(false)}
            value={form.role_name}
            onChange={(e) => {
              set("role_name", e.target.value);
              set("zone_id", "");
              set("house_no", "");
            }}
            required
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>

        {/* Zone Leader extra fields — animated appearance */}
        {isZL && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-[fadeIn_0.2s_ease]">
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold text-amber-800 mb-3 flex items-center gap-1.5">
                <MapPin size={13} /> Zone Leader Assignment
              </p>
            </div>
            <Field label="Assign Zone" icon={MapPin} required>
              <select
                className={`${inputClass()} appearance-none cursor-pointer disabled:bg-gray-100`}
                value={form.zone_id}
                onChange={(e) => set("zone_id", e.target.value)}
                required
                disabled={loadingZones}
              >
                <option value="" disabled>
                  {loadingZones ? "Loading…" : "Select zone"}
                </option>
                {zones.map((z) => (
                  <option key={z.zone_id} value={z.zone_id}>
                    {z.zone_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="House No." icon={Home}>
              <input
                className={inputClass()}
                value={form.house_no}
                onChange={(e) => set("house_no", e.target.value)}
                placeholder="e.g. 12-B"
              />
            </Field>
          </div>
        )}

        {/* Password — only shown for new user, or optional on edit */}
        {!isEdit && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Password" required>
              <input
                type={showPw ? "text" : "password"}
                className={`${inputClass(false)} pr-10`}
                value={form.password}
                onChange={(e) => {
                  set("password", e.target.value);
                  setStrength(calcStrength(e.target.value));
                }}
                required
                minLength={8}
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </Field>
            <Field label="Confirm Password" required>
              <input
                type={showCpw ? "text" : "password"}
                className={`${inputClass(false)} pr-10`}
                value={form.password_confirmation}
                onChange={(e) => set("password_confirmation", e.target.value)}
                required
                minLength={8}
                placeholder="Repeat password"
              />
              <button
                type="button"
                onClick={() => setShowCpw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCpw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </Field>
            {form.password && (
              <div className="sm:col-span-2 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Strength</span>
                  <span
                    className={
                      strength < 40
                        ? "text-red-500 font-semibold"
                        : strength < 70
                          ? "text-amber-500 font-semibold"
                          : "text-emerald-600 font-semibold"
                    }
                  >
                    {strength < 40
                      ? "Weak"
                      : strength < 70
                        ? "Medium"
                        : "Strong"}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strength < 40 ? "bg-red-400" : strength < 70 ? "bg-amber-400" : "bg-emerald-500"}`}
                    style={{ width: `${strength}%` }}
                  />
                </div>
                {form.password_confirmation && (
                  <div
                    className={`flex items-center gap-1.5 text-xs font-semibold ${form.password === form.password_confirmation ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {form.password === form.password_confirmation ? (
                      <>
                        <Check size={13} /> Passwords match
                      </>
                    ) : (
                      <>
                        <X size={13} /> Passwords do not match
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Saving…
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create User"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ─── CHANGE PASSWORD PANEL ──────────────────────────────────── */
const ChangePasswordPanel = ({ user, onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState({ password: "", password_confirmation: "" });
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [strength, setStrength] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
        <button
          onClick={onCancel}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-base font-bold text-gray-900">Change Password</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Setting new password for{" "}
            <span className="font-semibold">
              {user?.first_name} {user?.last_name}
            </span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5 max-w-md">
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
          The user will need to use this new password on their next login.
        </div>

        <Field label="New Password" required>
          <input
            type={showPw ? "text" : "password"}
            className={`${inputClass(false)} pr-10`}
            value={form.password}
            required
            minLength={8}
            placeholder="Min. 8 characters"
            onChange={(e) => {
              setForm((p) => ({ ...p, password: e.target.value }));
              setStrength(calcStrength(e.target.value));
            }}
          />
          <button
            type="button"
            onClick={() => setShowPw((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </Field>

        {form.password && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Strength</span>
              <span
                className={
                  strength < 40
                    ? "text-red-500 font-semibold"
                    : strength < 70
                      ? "text-amber-500 font-semibold"
                      : "text-emerald-600 font-semibold"
                }
              >
                {strength < 40 ? "Weak" : strength < 70 ? "Medium" : "Strong"}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${strength < 40 ? "bg-red-400" : strength < 70 ? "bg-amber-400" : "bg-emerald-500"}`}
                style={{ width: `${strength}%` }}
              />
            </div>
          </div>
        )}

        <Field label="Confirm Password" required>
          <input
            type={showCpw ? "text" : "password"}
            className={`${inputClass(false)} pr-10`}
            value={form.password_confirmation}
            required
            minLength={8}
            placeholder="Repeat password"
            onChange={(e) =>
              setForm((p) => ({ ...p, password_confirmation: e.target.value }))
            }
          />
          <button
            type="button"
            onClick={() => setShowCpw((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showCpw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </Field>

        {form.password_confirmation && (
          <div
            className={`flex items-center gap-1.5 text-xs font-semibold ${form.password === form.password_confirmation ? "text-emerald-600" : "text-red-500"}`}
          >
            {form.password === form.password_confirmation ? (
              <>
                <Check size={13} /> Passwords match
              </>
            ) : (
              <>
                <X size={13} /> Passwords do not match
              </>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Updating…
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ─── DELETE CONFIRM PANEL ───────────────────────────────────── */
const DeletePanel = ({ user, onConfirm, onCancel, submitting }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
      <button
        onClick={onCancel}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
      >
        <ArrowLeft size={18} />
      </button>
      <div>
        <h2 className="text-base font-bold text-gray-900">Archive User</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          This will deactivate the user's account
        </p>
      </div>
    </div>

    <div className="p-6 max-w-md space-y-5">
      <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={22} className="text-red-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">
            {user?.first_name} {user?.last_name}
          </p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">
        Archiving this user will{" "}
        <span className="font-semibold text-gray-900">
          deactivate their account
        </span>{" "}
        and prevent them from logging in. This action can be reversed by an
        administrator.
      </p>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={submitting}
          className="px-6 py-2.5 text-sm rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Archiving…
            </>
          ) : (
            "Archive User"
          )}
        </button>
      </div>
    </div>
  </div>
);

/* ─── MAIN INNER COMPONENT ───────────────────────────────────── */
const UserManagementInner = () => {
  const {
    users,
    loading,
    error,
    refresh,
    addUser,
    editUser,
    deleteUser,
    changePassword,
  } = useUserManagement();

  // view: "list" | "add" | "edit" | "password" | "delete"
  const [view, setView] = useState("list");
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearch] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((p) => ({ ...p, show: false })), 4000);
  }, []);

  const goList = () => {
    setView("list");
    setCurrentUser(null);
  };

  const openEdit = (user) => {
    setCurrentUser(user);
    setView("edit");
  };
  const openPassword = (user) => {
    setCurrentUser(user);
    setView("password");
  };
  const openDelete = (user) => {
    setCurrentUser(user);
    setView("delete");
  };

  /* ── CRUD handlers ── */
  const handleAdd = async (form) => {
    setSubmitting(true);
    try {
      await addUser(form);
      showToast("User created successfully!");
      goList();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to create user.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (form) => {
    setSubmitting(true);
    try {
      await editUser(currentUser.user_id ?? currentUser.id, form);
      showToast("User updated successfully!");
      goList();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update user.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePassword = async (form) => {
    setSubmitting(true);
    try {
      await changePassword(currentUser.user_id ?? currentUser.id, form);
      showToast("Password updated successfully!");
      goList();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update password.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await deleteUser(currentUser.user_id ?? currentUser.id);
      showToast("User archived successfully.");
      goList();
    } catch (err) {
      showToast("Failed to archive user.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Filtering ── */
  const filtered = users.filter((u) => {
    if (!u) return false;
    const roleName = u.role?.role_name ?? u.role ?? "";
    const matchRole = filter === "All" || roleName === filter;
    const fullName = `${u.first_name ?? ""} ${u.last_name ?? ""}`.toLowerCase();
    const matchSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchRole && matchSearch;
  });

  /* ── Render ── */
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((p) => ({ ...p, show: false }))}
      />

      {/* Page header — always visible */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            User Management
          </h1>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
            Manage system users, roles, and permissions
          </p>
        </div>

        {view === "list" && (
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={loading}
              title="Refresh"
              className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all disabled:opacity-40"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setView("add")}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              <UserPlus size={16} /> Add User
            </button>
          </div>
        )}
      </div>

      {/* Breadcrumb when in sub-view */}
      {view !== "list" && (
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <button
            onClick={goList}
            className="hover:text-emerald-600 font-medium transition-colors"
          >
            Users
          </button>
          <ChevronRight size={13} />
          <span className="text-gray-700 font-semibold capitalize">
            {view === "add"
              ? "Add User"
              : view === "edit"
                ? "Edit User"
                : view === "password"
                  ? "Change Password"
                  : "Archive User"}
          </span>
        </div>
      )}

      {/* ── Sub-views ── */}
      {view === "add" && (
        <UserForm
          mode="add"
          onSubmit={handleAdd}
          onCancel={goList}
          submitting={submitting}
        />
      )}
      {view === "edit" && (
        <UserForm
          mode="edit"
          user={currentUser}
          onSubmit={handleEdit}
          onCancel={goList}
          submitting={submitting}
        />
      )}
      {view === "password" && (
        <ChangePasswordPanel
          user={currentUser}
          onSubmit={handlePassword}
          onCancel={goList}
          submitting={submitting}
        />
      )}
      {view === "delete" && (
        <DeletePanel
          user={currentUser}
          onConfirm={handleDelete}
          onCancel={goList}
          submitting={submitting}
        />
      )}

      {/* ── List view ── */}
      {view === "list" && (
        <>
          {/* Search + filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200 gap-1">
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setFilter(role)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    filter === role
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-800 hover:bg-white"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
              <AlertTriangle size={15} className="flex-shrink-0" /> {error}
              <button
                onClick={refresh}
                className="ml-auto text-xs underline hover:no-underline font-bold"
              >
                Retry
              </button>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <UserTableSkeleton />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-left border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">
                        Email
                      </th>
                      <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">
                        Role / Zone
                      </th>
                      <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((user) => {
                      const roleName = user.role?.role_name ?? user.role ?? "—";
                      const zoneName =
                        user.zone_leader?.zone?.zone_name ?? null;
                      const initials =
                        `${user.first_name?.charAt(0) ?? ""}${user.last_name?.charAt(0) ?? ""}`.toUpperCase();
                      const accent =
                        roleAccent[roleName] ?? "from-gray-400 to-gray-600";

                      return (
                        <tr
                          key={user.user_id ?? user.id}
                          className="hover:bg-gray-50/60 transition-colors group"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-br ${accent} text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-105 transition-transform`}
                              >
                                {initials || <Users size={14} />}
                              </div>
                              <div className="min-w-0">
                                <span className="font-semibold text-gray-900 block truncate">
                                  {user.first_name}{" "}
                                  {user.middle_name
                                    ? user.middle_name + " "
                                    : ""}
                                  {user.last_name}
                                </span>
                                <span className="text-xs text-gray-400 sm:hidden block truncate">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-gray-500 text-sm hidden sm:table-cell">
                            {user.email}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border w-fit ${roleColors[roleName] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}
                              >
                                <ShieldCheck size={11} />
                                {roleName}
                              </span>
                              {zoneName && (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-medium">
                                  <MapPin size={11} /> {zoneName}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => openEdit(user)}
                                title="Edit"
                                className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => openPassword(user)}
                                title="Change password"
                                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
                              >
                                <KeyRound size={15} />
                              </button>
                              <button
                                onClick={() => openDelete(user)}
                                title="Archive"
                                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-16 px-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={22} className="text-gray-300" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">
                    No users found
                  </h3>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    {searchQuery
                      ? `No results for "${searchQuery}".`
                      : "Try adjusting your filters or add a new user."}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ─── Export ─────────────────────────────────────────────────── */
const UserManagement = () => (
  <UserManagementProvider>
    <UserManagementInner />
  </UserManagementProvider>
);

export default UserManagement;
