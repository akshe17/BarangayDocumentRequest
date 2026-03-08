import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  createContext,
} from "react";
import {
  Archive,
  RefreshCw,
  Search,
  RotateCcw,
  Users,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronLeft,
  Mail,
  MapPin,
  Home,
  Calendar,
  UserCheck,
  UserX,
  Clock,
  Hash,
  Briefcase,
  Eye,
} from "lucide-react";
import Skeleton from "../../components/Skeleton";
import api from "../../axious/api";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const ROLE_OPTIONS = [
  { label: "All Roles", value: "" },
  { label: "Resident", value: "2" },
  { label: "Clerk", value: "3" },
  { label: "Zone Leader", value: "4" },
];

const ROLE_META = {
  2: { label: "Resident", cls: "bg-slate-100 text-slate-600 border-slate-200" },
  3: { label: "Clerk", cls: "bg-blue-50 text-blue-700 border-blue-100" },
  4: {
    label: "Zone Leader",
    cls: "bg-violet-50 text-violet-700 border-violet-100",
  },
};

const AVATAR_COLOR = {
  2: "bg-emerald-100 text-emerald-700",
  3: "bg-blue-100 text-blue-700",
  4: "bg-violet-100 text-violet-700",
};

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const fmt = (val) => val || "—";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const calcAge = (birthdate) => {
  if (!birthdate) return null;
  return Math.floor(
    (Date.now() - new Date(birthdate).getTime()) /
      (1000 * 60 * 60 * 24 * 365.25),
  );
};

/* ─────────────────────────────────────────────────────────────
   CONTEXT  — fetch once, share everywhere
───────────────────────────────────────────────────────────── */
const ArchivedUsersContext = createContext(null);

const ArchivedUsersProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else if (users.length === 0) setLoading(true); // only show full skeleton on first load
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (roleFilter) params.set("role_id", roleFilter);
        const res = await api.get(`/admin/archived-users?${params}`);
        const fetched = Array.isArray(res.data?.users) ? res.data.users : [];
        setUsers(fetched);
        setTotal(
          typeof res.data?.total === "number" ? res.data.total : fetched.length,
        );
      } catch (err) {
        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            "Failed to load archived users.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, roleFilter],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch on mount and whenever filters change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Remove a single user from cache after restore (no refetch needed)
  const removeUser = useCallback((userId) => {
    setUsers((prev) => prev.filter((u) => u.user_id !== userId));
    setTotal((t) => Math.max(0, t - 1));
  }, []);

  return (
    <ArchivedUsersContext.Provider
      value={{
        users,
        total,
        loading,
        refreshing,
        error,
        search,
        setSearch,
        roleFilter,
        setRoleFilter,
        fetchUsers,
        removeUser,
      }}
    >
      {children}
    </ArchivedUsersContext.Provider>
  );
};

const useArchivedUsers = () => {
  const ctx = useContext(ArchivedUsersContext);
  if (!ctx)
    throw new Error(
      "useArchivedUsers must be used inside ArchivedUsersProvider",
    );
  return ctx;
};

/* ─────────────────────────────────────────────────────────────
   SHARED UI COMPONENTS
───────────────────────────────────────────────────────────── */
const Avatar = ({ firstName = "", lastName = "", roleId, size = "sm" }) => {
  const initials =
    ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase() || "?";
  const colorCls =
    AVATAR_COLOR[Number(roleId)] ?? "bg-slate-100 text-slate-500";
  const sizeCls =
    size === "xl"
      ? "w-20 h-20 text-2xl rounded-2xl"
      : size === "lg"
        ? "w-14 h-14 text-lg rounded-xl"
        : size === "md"
          ? "w-10 h-10 text-sm rounded-xl"
          : "w-9 h-9 text-[11px] rounded-xl";
  return (
    <div
      className={`${sizeCls} ${colorCls} flex items-center justify-center shrink-0 font-black select-none`}
    >
      {initials}
    </div>
  );
};

const RolePill = ({ roleId, role }) => {
  const meta = ROLE_META[Number(roleId)] ?? {
    label: role,
    cls: "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${meta.cls}`}
    >
      {meta.label}
    </span>
  );
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold
      ${type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"}`}
    >
      {type === "success" ? (
        <CheckCircle2 size={15} />
      ) : (
        <AlertCircle size={15} />
      )}
      {message}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100">
        <X size={13} />
      </button>
    </div>
  );
};

const ConfirmModal = ({ user, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-sm w-full p-6 space-y-4">
      <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
        <RotateCcw size={18} className="text-emerald-600" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-black text-slate-900">Restore User?</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          <span className="font-bold text-slate-700">
            {user.first_name} {user.last_name}
          </span>{" "}
          will be reactivated and able to log in again.
        </p>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:border-slate-300 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw size={11} className="animate-spin" /> Restoring…
            </>
          ) : (
            <>
              <RotateCcw size={11} /> Restore
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   LIST PAGE SKELETON
───────────────────────────────────────────────────────────── */
const ListSkeleton = () => (
  <div className="min-h-screen bg-slate-50">
    <div className="bg-white border-b border-slate-100 px-6 py-5">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton.Block className="w-9 h-9 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton.Block className="w-36 h-4" />
            <Skeleton.Block className="w-48 h-3" />
          </div>
        </div>
        <Skeleton.Block className="w-24 h-9 rounded-xl" />
      </div>
    </div>
    <div className="max-w-5xl mx-auto px-6 py-6 space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3"
          >
            <Skeleton.Block className="w-9 h-9 rounded-xl" />
            <Skeleton.Block className="w-12 h-7" />
            <Skeleton.Block className="w-20 h-2.5" />
          </div>
        ))}
      </div>
      <Skeleton.Table rows={5} cols={4} />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   DETAIL PAGE COMPONENTS
───────────────────────────────────────────────────────────── */
const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-4 py-3.5 border-b border-slate-100 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={13} className="text-slate-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
        {label}
      </p>
      <div className="text-sm font-semibold text-slate-800">{children}</div>
    </div>
  </div>
);

const InfoCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
    <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
        {title}
      </p>
    </div>
    <div className="px-5 py-1">{children}</div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   DETAIL PAGE
───────────────────────────────────────────────────────────── */
const DetailPage = ({ user, onBack }) => {
  const { removeUser } = useArchivedUsers();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [toast, setToast] = useState(null);

  const roleId = Number(user.role_id);
  const age = calcAge(user.birthdate);

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const res = await api.patch(
        `/admin/archived-users/${user.user_id}/restore`,
      );
      setToast({ message: res.data.message, type: "success" });
      // Update context cache immediately, then navigate back
      removeUser(user.user_id);
      setTimeout(onBack, 1200);
    } catch (err) {
      setToast({
        message: err?.response?.data?.message || "Failed to restore user.",
        type: "error",
      });
      setRestoring(false);
    }
    setConfirmOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors group"
          >
            <ChevronLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back to Archived Users
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={restoring}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600
                       text-white text-xs font-bold transition-colors disabled:opacity-60 shadow-sm"
          >
            <RotateCcw size={12} className={restoring ? "animate-spin" : ""} />
            {restoring ? "Restoring…" : "Restore User"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-6 py-7 space-y-5">
        {/* Hero identity card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar
            firstName={user.first_name}
            lastName={user.last_name}
            roleId={roleId}
            size="xl"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-slate-900 leading-tight">
              {user.first_name}
              {user.middle_name ? ` ${user.middle_name}` : ""}
              {` ${user.last_name}`}
            </h1>
            <p className="text-sm text-slate-400 font-mono mt-0.5">
              ID-{String(user.user_id).padStart(4, "0")}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <RolePill roleId={roleId} role={user.role} />
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                <Archive size={9} /> Archived {user.archived_at}
              </span>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Account — all roles */}
          <InfoCard title="Account Information">
            <InfoRow icon={Hash} label="User ID">
              <span className="font-mono">
                ID-{String(user.user_id).padStart(4, "0")}
              </span>
            </InfoRow>
            <InfoRow icon={Mail} label="Email Address">
              {fmt(user.email)}
            </InfoRow>
            <InfoRow icon={Calendar} label="Date Registered">
              {fmt(user.created_at)}
            </InfoRow>
            <InfoRow icon={Clock} label="Archived">
              {fmt(user.archived_at)}
            </InfoRow>
          </InfoCard>

          {/* Resident */}
          {roleId === 2 && (
            <InfoCard title="Resident Details">
              <InfoRow icon={MapPin} label="Zone">
                {fmt(user.zone)}
              </InfoRow>
              <InfoRow icon={Home} label="House No.">
                {fmt(user.house_no)}
              </InfoRow>
              <InfoRow icon={Calendar} label="Birthdate">
                {user.birthdate ? (
                  <span className="flex items-center gap-2">
                    {formatDate(user.birthdate)}
                    {age && (
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {age} yrs
                      </span>
                    )}
                  </span>
                ) : (
                  "—"
                )}
              </InfoRow>
              <InfoRow icon={Users} label="Gender">
                {fmt(user.gender)}
              </InfoRow>
              <InfoRow icon={Hash} label="Civil Status">
                {fmt(user.civil_status)}
              </InfoRow>
              <InfoRow
                icon={user.is_verified ? UserCheck : UserX}
                label="ID Verification"
              >
                {user.is_verified != null ? (
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full
                    ${
                      user.is_verified
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {user.is_verified ? (
                      <>
                        <UserCheck size={11} /> Verified
                      </>
                    ) : (
                      <>
                        <UserX size={11} /> Not Verified
                      </>
                    )}
                  </span>
                ) : (
                  "—"
                )}
              </InfoRow>
            </InfoCard>
          )}

          {/* Zone Leader */}
          {roleId === 4 && (
            <InfoCard title="Zone Leader Details">
              <InfoRow icon={MapPin} label="Assigned Zone">
                {fmt(user.zone)}
              </InfoRow>
              <InfoRow icon={Home} label="House No.">
                {fmt(user.house_no)}
              </InfoRow>
            </InfoCard>
          )}

          {/* Clerk */}
          {roleId === 3 && (
            <InfoCard title="Clerk Details">
              <InfoRow icon={Briefcase} label="Position">
                Barangay Clerk
              </InfoRow>
              <InfoRow icon={Hash} label="Staff ID">
                <span className="font-mono">
                  CLK-{String(user.user_id).padStart(4, "0")}
                </span>
              </InfoRow>
            </InfoCard>
          )}
        </div>

        {/* Restore footer */}
        <div className="bg-white rounded-2xl border border-slate-100 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-slate-800">
              Restore this account
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              The user will be reactivated and can log in immediately.
            </p>
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={restoring}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600
                       text-white text-sm font-bold transition-colors disabled:opacity-60 shadow-sm whitespace-nowrap"
          >
            <RotateCcw size={13} className={restoring ? "animate-spin" : ""} />
            {restoring ? "Restoring…" : "Restore User"}
          </button>
        </div>
      </div>

      {confirmOpen && (
        <ConfirmModal
          user={user}
          onConfirm={handleRestore}
          onCancel={() => setConfirmOpen(false)}
          loading={restoring}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   LIST PAGE
───────────────────────────────────────────────────────────── */
const ListPage = ({ onViewUser }) => {
  const {
    users,
    total,
    loading,
    refreshing,
    error,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    fetchUsers,
  } = useArchivedUsers();

  const roleCount = (id) =>
    users.filter((u) => Number(u.role_id) === id).length;

  if (loading) return <ListSkeleton />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shadow-sm">
              <Archive size={15} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">
                Archived Users
              </h1>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Deactivated accounts · restore to re-enable access
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold
                       text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-5">
        {error && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-600">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Archived",
              value: total,
              icon: Archive,
              color: "bg-slate-800",
            },
            {
              label: "Residents",
              value: roleCount(2),
              icon: Users,
              color: "bg-emerald-500",
            },
            {
              label: "Staff",
              value: roleCount(3) + roleCount(4),
              icon: ShieldCheck,
              color: "bg-violet-500",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3 hover:border-slate-200 hover:shadow-sm transition-all"
            >
              <div
                className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shadow-sm`}
              >
                <Icon size={15} className="text-white" />
              </div>
              <p className="text-3xl font-black text-slate-900 tabular-nums leading-none">
                {value}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={13}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700
                           placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
              />
            </div>
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium
                           text-slate-600 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors cursor-pointer"
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Archive size={18} className="text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400">
                No archived users found
              </p>
              {(search || roleFilter) && (
                <button
                  onClick={() => {
                    setSearch("");
                    setRoleFilter("");
                  }}
                  className="text-xs text-emerald-500 hover:text-emerald-600 font-bold"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {[
                      { label: "User", hide: "" },
                      { label: "Role", hide: "" },
                      { label: "Zone", hide: "hidden sm:table-cell" },
                      { label: "Archived", hide: "hidden md:table-cell" },
                    ].map(({ label, hide }) => (
                      <th
                        key={label}
                        className={`px-5 py-3 text-left text-[9px] font-black tracking-[0.12em] uppercase text-slate-400 ${hide}`}
                      >
                        {label}
                      </th>
                    ))}
                    <th className="px-5 py-3 text-right text-[9px] font-black tracking-[0.12em] uppercase text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.user_id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => onViewUser(user)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar
                            firstName={user.first_name}
                            lastName={user.last_name}
                            roleId={user.role_id}
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-800 leading-tight">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5 max-w-[180px] truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <RolePill roleId={user.role_id} role={user.role} />
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <p className="text-xs text-slate-500">
                          {fmt(user.zone)}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <p className="text-xs text-slate-400">
                          {user.archived_at}
                        </p>
                      </td>
                      <td
                        className="px-5 py-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onViewUser(user)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200
                                     text-slate-600 text-[10px] font-bold hover:bg-slate-100 hover:border-slate-300 transition-colors"
                        >
                          <Eye size={10} /> View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {users.length > 0 && (
          <p className="text-[11px] text-slate-300 text-right font-mono">
            {users.length} of {total} archived user{total !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   ROOT — context wraps both pages so data is shared
───────────────────────────────────────────────────────────── */
const ArchivedUsersInner = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  if (selectedUser) {
    return (
      <DetailPage user={selectedUser} onBack={() => setSelectedUser(null)} />
    );
  }
  return <ListPage onViewUser={setSelectedUser} />;
};

const ArchivedUsers = () => (
  <ArchivedUsersProvider>
    <ArchivedUsersInner />
  </ArchivedUsersProvider>
);

export default ArchivedUsers;
