import React, { useState, useEffect, useMemo } from "react";
import api from "../../axious/api";
import {
  Activity,
  Calendar,
  User,
  Edit,
  ShieldCheck,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  RefreshCw,
  Search,
  Filter,
  X,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import Skeleton from "../../components/Skeleton";
// ─── Type config ──────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  verification: {
    icon: ShieldCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-800",
    label: "Verified",
  },
  rejection: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-800",
    label: "Rejected",
  },
  request: {
    icon: FileText,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-800",
    label: "Request",
  },
  resubmission: {
    icon: AlertCircle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-800",
    label: "Resubmitted",
  },
  update: {
    icon: Edit,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-800",
    label: "Updated",
  },
};

const DEFAULT_CONFIG = {
  icon: Activity,
  color: "text-gray-500",
  bg: "bg-gray-50",
  border: "border-gray-200",
  badge: "bg-gray-100 text-gray-700",
  label: "Activity",
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "action", label: "Action A–Z" },
];

// ─── Highlight matching text ──────────────────────────────────────────────────
const Highlight = ({ text = "", query = "" }) => {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.trim()})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <mark
            key={i}
            className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ZoneLeaderLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Search & filter state
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [sort, setSort] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);

  const fetchLogs = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const response = await api.get("/zone-leader/logs");
      setLogs(response.data);
    } catch (err) {
      console.error("API Error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch logs. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Close sort dropdown on outside click
  useEffect(() => {
    const close = () => setSortOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // Derived: unique types in data
  const availableTypes = useMemo(() => {
    const types = [...new Set(logs.map((l) => l.type))];
    return types;
  }, [logs]);

  // Derived: type counts
  const typeCounts = useMemo(
    () =>
      logs.reduce((acc, l) => {
        acc[l.type] = (acc[l.type] || 0) + 1;
        return acc;
      }, {}),
    [logs],
  );

  // Derived: filtered + sorted logs
  const filtered = useMemo(() => {
    let result = [...logs];

    // Filter by type
    if (activeType !== "all") {
      result = result.filter((l) => l.type === activeType);
    }

    // Filter by search query (action + description + user)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (l) =>
          l.action?.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q) ||
          l.user?.toLowerCase().includes(q),
      );
    }

    // Sort
    if (sort === "newest") {
      result.sort(
        (a, b) =>
          new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`),
      );
    } else if (sort === "oldest") {
      result.sort(
        (a, b) =>
          new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`),
      );
    } else if (sort === "action") {
      result.sort((a, b) => a.action?.localeCompare(b.action));
    }

    return result;
  }, [logs, activeType, search, sort]);

  const hasActiveFilters = search.trim() || activeType !== "all";

  const clearFilters = () => {
    setSearch("");
    setActiveType("all");
    setSort("newest");
  };

  return (
    <div className="space-y-5 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              My Activity Logs
            </h1>
            <p className="text-gray-500 text-sm">
              Personal log of your actions
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchLogs(true)}
          disabled={loading || refreshing}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-500 shadow-sm hover:border-emerald-400 hover:text-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Search + Sort bar ── */}
      {!loading && !error && logs.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search action, description, user…"
              className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition-all placeholder:text-gray-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSortOpen((o) => !o)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 shadow-sm hover:border-gray-300 transition-all"
            >
              <ArrowUpDown size={13} className="text-gray-400" />
              {SORT_OPTIONS.find((o) => o.value === sort)?.label}
              <ChevronDown
                size={12}
                className={`text-gray-400 transition-transform ${sortOpen ? "rotate-180" : ""}`}
              />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[150px] overflow-hidden">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSort(opt.value);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      sort === opt.value
                        ? "bg-emerald-50 text-emerald-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-red-500 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <X size={11} /> Clear
            </button>
          )}
        </div>
      )}

      {/* ── Type filter pills ── */}
      {!loading && !error && logs.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={13} className="text-gray-400 flex-shrink-0" />

          {/* All pill */}
          <button
            onClick={() => setActiveType("all")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
              activeType === "all"
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
            }`}
          >
            All
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeType === "all" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}
            >
              {logs.length}
            </span>
          </button>

          {/* Type pills */}
          {availableTypes.map((type) => {
            const cfg = TYPE_CONFIG[type] || DEFAULT_CONFIG;
            const isActive = activeType === type;
            return (
              <button
                key={type}
                onClick={() => setActiveType(isActive ? "all" : type)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  isActive
                    ? `${cfg.badge} border-transparent`
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                }`}
              >
                {cfg.label}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-black/10" : "bg-gray-100 text-gray-500"}`}
                >
                  {typeCounts[type] || 0}
                </span>
              </button>
            );
          })}

          {/* Results count */}
          <span className="ml-auto text-xs text-gray-400 font-medium">
            {filtered.length} of {logs.length} logs
          </span>
        </div>
      )}

      {/* ── Logs list ── */}
      <div className="space-y-3">
        {/* Skeleton */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <Skeleton.Rows count={5} showBadge={true} />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white p-8 rounded-xl border border-red-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={22} className="text-red-500" />
            </div>
            <p className="font-bold text-gray-800 text-sm mb-1">
              Something went wrong
            </p>
            <p className="text-xs text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => fetchLogs()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty — no data at all */}
        {!loading && !error && logs.length === 0 && (
          <div className="bg-white p-12 rounded-xl border border-gray-200 shadow-sm text-center">
            <Activity size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-sm text-gray-500">
              No activity logs found for your account.
            </p>
          </div>
        )}

        {/* Empty — filtered to nothing */}
        {!loading && !error && logs.length > 0 && filtered.length === 0 && (
          <div className="bg-white p-10 rounded-xl border border-gray-200 shadow-sm text-center">
            <Search size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-sm text-gray-700 mb-1">
              No logs match your search
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Try adjusting your filters or search term.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Real log cards */}
        {!loading &&
          !error &&
          filtered.map((log) => {
            const cfg = TYPE_CONFIG[log.type] || DEFAULT_CONFIG;
            const Icon = cfg.icon;
            return (
              <div
                key={log.id}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${cfg.bg} ${cfg.border}`}
                    >
                      <Icon size={18} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-bold text-gray-900">
                          <Highlight text={log.action} query={search} />
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${cfg.badge}`}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        <Highlight text={log.description} query={search} />
                      </p>
                      <div className="flex items-center gap-1.5 text-xs">
                        <User size={11} className="text-gray-400" />
                        <span className={`font-semibold ${cfg.color}`}>
                          <Highlight text={log.user} query={search} />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-1">
                      <Clock size={12} className="text-gray-400" />
                      {log.time}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                      <Calendar size={10} className="text-gray-300" />
                      {log.date}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ZoneLeaderLogs;
