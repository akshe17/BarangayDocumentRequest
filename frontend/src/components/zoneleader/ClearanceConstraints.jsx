import {
  Clock,
  CalendarClock,
  PackageCheck,
  XCircle,
  BadgeCheck,
} from "lucide-react";

// ── Date formatter (en-PH locale) ────────────────────────────────────────────
export const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

// ── Today's date string for <input type="date" min=…> ────────────────────────
export const todayStr = () => new Date().toISOString().split("T")[0];

// ── Status map  1=Pending · 2=Approved · 3=Completed · 4=Rejected · 5=Ready ─
export const STATUS = {
  1: {
    label: "Pending",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  2: {
    label: "Approved",
    cls: "bg-emerald-50 text-emerald-800 border-emerald-300",
  },
  3: {
    label: "Completed",
    cls: "bg-gray-100   text-gray-600   border-gray-200",
  },
  4: { label: "Rejected", cls: "bg-red-50     text-red-700    border-red-200" },
  5: {
    label: "Ready for Pickup",
    cls: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
};

// ── Tab definitions ───────────────────────────────────────────────────────────
export const TABS = [
  {
    id: 1,
    label: "Pending",
    icon: Clock,
    dot: "bg-emerald-500",
    active: "border-emerald-500 text-emerald-700",
    inactive: "border-transparent text-gray-400 hover:text-gray-600",
    emptyMsg: "No pending requests",
    emptyHint: "All caught up!",
  },
  {
    id: 2,
    label: "Approved",
    icon: CalendarClock,
    dot: "bg-emerald-600",
    active: "border-emerald-600 text-emerald-800",
    inactive: "border-transparent text-gray-400 hover:text-gray-600",
    emptyMsg: "No approved requests",
    emptyHint: "Nothing scheduled yet.",
  },
  {
    id: 5,
    label: "Ready for Pickup",
    icon: PackageCheck,
    dot: "bg-emerald-400",
    active: "border-emerald-400 text-emerald-700",
    inactive: "border-transparent text-gray-400 hover:text-gray-600",
    emptyMsg: "Nothing awaiting pickup",
    emptyHint: "No documents ready yet.",
  },
  {
    id: 3,
    label: "Completed",
    icon: BadgeCheck,
    dot: "bg-gray-400",
    active: "border-gray-500 text-gray-700",
    inactive: "border-transparent text-gray-400 hover:text-gray-600",
    emptyMsg: "No completed requests",
    emptyHint: "None finished yet.",
  },
  {
    id: 4,
    label: "Rejected",
    icon: XCircle,
    dot: "bg-red-400",
    active: "border-red-500 text-red-700",
    inactive: "border-transparent text-gray-400 hover:text-gray-600",
    emptyMsg: "No rejected requests",
    emptyHint: "Clean record!",
  },
];
