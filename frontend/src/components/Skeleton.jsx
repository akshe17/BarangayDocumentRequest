/**
 * Skeleton.jsx — reusable skeleton primitives + pre-built layouts
 *
 * PRIMITIVES  (compose these however you like)
 *   <SkeletonBlock />          — a plain rectangular placeholder
 *   <SkeletonText  />          — one or more text-line placeholders
 *   <SkeletonCircle />         — circular placeholder (avatar, icon)
 *
 * PRE-BUILT LAYOUTS  (drop-in while your page is loading)
 *   <SkeletonStatGrid />       — row of stat cards  (dashboard numbers)
 *   <SkeletonRow />            — single list / table row
 *   <SkeletonRows count={n} /> — n stacked rows
 *   <SkeletonCard />           — a generic content card
 *   <SkeletonTable />          — thead + n tbody rows
 *   <SkeletonFormField />      — label + input placeholder
 *   <SkeletonHero />           — full-width hero banner
 */

import React, { useEffect } from "react";

/* ─────────────────────────────────────────────────────────────
   INJECT SHIMMER KEYFRAMES ONCE INTO <head>
   ───────────────────────────────────────────────────────────── */
const STYLE_ID = "skeleton-shimmer-style";

const injectShimmerStyle = () => {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes skeleton-shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position:  600px 0; }
    }
    /* Light variant — use on white/light backgrounds */
    .sk {
      background: linear-gradient(90deg, #d6d8db 25%, #c9cacb 50%, #a6a7a9 75%);
      background-size: 1200px 100%;
      animation: skeleton-shimmer 1.6s ease-in-out infinite;
      border-radius: 0.375rem;
    }
    /* Dark variant — use on dark/colored backgrounds */
    .sk-dark {
      background: linear-gradient(
        90deg,
        rgba(83, 81, 81, 0.1) 25%,
        rgba(255,255,255,0.22) 50%,
        rgba(255,255,255,0.10) 75%
      );
      background-size: 1200px 100%;
      animation: skeleton-shimmer 1.6s ease-in-out infinite;
      border-radius: 0.375rem;
    }
  `;
  document.head.appendChild(style);
};

// Inject immediately at module load time (no React needed)
if (typeof document !== "undefined") injectShimmerStyle();

/* ═══════════════════════════════════════════════════════════════
   PRIMITIVES
   ═══════════════════════════════════════════════════════════════ */

/**
 * SkeletonBlock — raw rectangle placeholder
 * @param {string}  className   Tailwind classes for size/shape/etc.
 * @param {boolean} dark        Use lighter shimmer for dark backgrounds
 */
export const SkeletonBlock = ({ className = "", dark = false }) => (
  <div className={`${dark ? "sk-dark" : "sk"} ${className}`} />
);

/**
 * SkeletonText — one or more text-line placeholders
 * @param {number}  lines      How many lines to render  (default 1)
 * @param {string}  className  Applied to each line
 * @param {boolean} lastShort  Shorten the last line (natural paragraph look)
 * @param {boolean} dark       Use lighter shimmer for dark backgrounds
 */
export const SkeletonText = ({
  lines = 1,
  className = "h-3",
  lastShort = true,
  dark = false,
}) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBlock
        key={i}
        dark={dark}
        className={`${className} ${
          lastShort && i === lines - 1 && lines > 1 ? "w-3/5" : "w-full"
        }`}
      />
    ))}
  </div>
);

/**
 * SkeletonCircle — circular placeholder
 * @param {string}  size   Tailwind size class, e.g. "w-10 h-10"
 * @param {boolean} dark   Use lighter shimmer for dark backgrounds
 */
export const SkeletonCircle = ({ size = "w-10 h-10", dark = false }) => (
  <div className={`${dark ? "sk-dark" : "sk"} rounded-full ${size}`} />
);

/* ═══════════════════════════════════════════════════════════════
   PRE-BUILT LAYOUTS
   ═══════════════════════════════════════════════════════════════ */

/**
 * SkeletonRow — icon + two text lines + right badge
 * Matches the RequestRow design in ResidentDashboard
 */
export const SkeletonRow = ({ showBadge = true }) => (
  <div className="p-5 flex items-center justify-between border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-4">
      <SkeletonBlock className="w-11 h-11 rounded-xl" />
      <div className="space-y-2">
        <SkeletonBlock className="w-36 h-3.5" />
        <SkeletonBlock className="w-24 h-2.5" />
      </div>
    </div>
    {showBadge && <SkeletonBlock className="w-20 h-6 rounded-full" />}
  </div>
);

/**
 * SkeletonRows — n stacked SkeletonRows
 */
export const SkeletonRows = ({ count = 4, showBadge = true }) => (
  <div>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonRow key={i} showBadge={showBadge} />
    ))}
  </div>
);

/**
 * SkeletonStatGrid — matches the 5-column stat card row
 */
export const SkeletonStatGrid = ({ count = 5 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3"
      >
        <SkeletonBlock className="w-9 h-9 rounded-xl" />
        <SkeletonBlock className="w-16 h-2.5" />
        <SkeletonBlock className="w-10 h-8" />
      </div>
    ))}
  </div>
);

/**
 * SkeletonCard — generic white card with a header + body lines
 */
export const SkeletonCard = ({ lines = 3, className = "" }) => (
  <div
    className={`bg-white rounded-2xl border border-slate-200 p-6 space-y-4 ${className}`}
  >
    <div className="flex items-center gap-3">
      <SkeletonBlock className="w-8 h-8 rounded-lg" />
      <div className="space-y-1.5 flex-1">
        <SkeletonBlock className="w-32 h-3" />
        <SkeletonBlock className="w-20 h-2.5" />
      </div>
    </div>
    <SkeletonText lines={lines} className="h-3" />
  </div>
);

/**
 * SkeletonTable — thead + n tbody rows
 */
export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
    <div className="flex gap-4 px-6 py-3 border-b border-slate-200 bg-slate-50">
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBlock key={i} className="h-3 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div
        key={r}
        className="flex gap-4 px-6 py-4 border-b border-slate-100 last:border-0"
      >
        {Array.from({ length: cols }).map((_, c) => (
          <SkeletonBlock
            key={c}
            className={`h-3 flex-1 ${c === 0 ? "w-32 flex-none" : ""}`}
          />
        ))}
      </div>
    ))}
  </div>
);

/**
 * SkeletonFormField — label above an input box
 */
export const SkeletonFormField = ({ className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    <SkeletonBlock className="w-24 h-3" />
    <SkeletonBlock className="w-full h-10 rounded-xl" />
  </div>
);

/**
 * SkeletonForm — stack of form fields + a submit button
 */
export const SkeletonForm = ({ fields = 4 }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
    {Array.from({ length: fields }).map((_, i) => (
      <SkeletonFormField key={i} />
    ))}
    <SkeletonBlock className="w-32 h-10 rounded-xl mt-2" />
  </div>
);

/**
 * SkeletonHero — full-width banner placeholder
 * Dark emerald background matches your actual hero so the transition
 * from skeleton → real content feels seamless.
 */
export const SkeletonHero = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden rounded-3xl min-h-[200px] ${className}`}
    style={{
      background:
        "linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)",
    }}
  >
    <div className="relative z-10 p-8 md:p-12 space-y-4">
      <SkeletonBlock dark className="w-40 h-6 rounded-full" />
      <SkeletonBlock dark className="w-72 h-9 rounded-xl" />
      <SkeletonBlock dark className="w-80 max-w-full h-4" />
      <div className="flex gap-3 pt-3">
        <SkeletonBlock dark className="w-36 h-11 rounded-xl" />
        <SkeletonBlock dark className="w-36 h-11 rounded-xl" />
      </div>
    </div>
  </div>
);

/**
 * SkeletonProfileHeader — avatar + name + role badge
 */
export const SkeletonProfileHeader = () => (
  <div className="flex items-center gap-4">
    <SkeletonCircle size="w-14 h-14" />
    <div className="space-y-2">
      <SkeletonBlock className="w-40 h-4" />
      <SkeletonBlock className="w-24 h-3" />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   DEFAULT EXPORT — convenience object
   e.g.  import Skeleton from "../components/Skeleton";
         <Skeleton.Rows count={5} />
   ───────────────────────────────────────────────────────────── */
const Skeleton = {
  Block: SkeletonBlock,
  Text: SkeletonText,
  Circle: SkeletonCircle,
  Row: SkeletonRow,
  Rows: SkeletonRows,
  StatGrid: SkeletonStatGrid,
  Card: SkeletonCard,
  Table: SkeletonTable,
  FormField: SkeletonFormField,
  Form: SkeletonForm,
  Hero: SkeletonHero,
  ProfileHeader: SkeletonProfileHeader,
};

export default Skeleton;
