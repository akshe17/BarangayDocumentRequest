import React from "react";

const Footer = () => {
  return (
    <footer className="relative w-full bg-emerald-500 overflow-hidden">
      <style>{`
        /* ── Document stack float ── */
        @keyframes stackFloat {
          0%, 100% { transform: translateY(0px) rotate(-6deg); }
          50%       { transform: translateY(-12px) rotate(-6deg); }
        }
        @keyframes stackFloat2 {
          0%, 100% { transform: translateY(0px) rotate(3deg); }
          50%       { transform: translateY(-8px) rotate(3deg); }
        }
        @keyframes stackFloat3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-14px) rotate(0deg); }
        }

        /* ── Stamp pulse ── */
        @keyframes stampPulse {
          0%, 100% { opacity: 0.18; transform: scale(1) rotate(-15deg); }
          50%       { opacity: 0.28; transform: scale(1.04) rotate(-15deg); }
        }

        /* ── Scanning line on front doc ── */
        @keyframes scan {
          0%   { transform: scaleX(0); transform-origin: left; opacity: 0; }
          10%  { opacity: 1; }
          50%  { transform: scaleX(1); transform-origin: left; }
          51%  { transform: scaleX(1); transform-origin: right; }
          90%  { opacity: 1; }
          100% { transform: scaleX(0); transform-origin: right; opacity: 0; }
        }

        /* ── Checkmark draw ── */
        @keyframes checkDraw {
          from { stroke-dashoffset: 40; }
          to   { stroke-dashoffset: 0; }
        }

        /* ── Seal spin ── */
        @keyframes sealSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── Particle drift ── */
        @keyframes drift1 {
          0%   { transform: translate(0, 0) scale(1); opacity: 0.25; }
          50%  { transform: translate(6px, -18px) scale(1.2); opacity: 0.5; }
          100% { transform: translate(-4px, -36px) scale(0.8); opacity: 0; }
        }
        @keyframes drift2 {
          0%   { transform: translate(0, 0) scale(1); opacity: 0.2; }
          50%  { transform: translate(-8px, -14px) scale(1.1); opacity: 0.4; }
          100% { transform: translate(5px, -30px) scale(0.7); opacity: 0; }
        }
        @keyframes drift3 {
          0%   { transform: translate(0, 0) scale(0.8); opacity: 0.3; }
          50%  { transform: translate(10px, -10px) scale(1); opacity: 0.5; }
          100% { transform: translate(2px, -28px) scale(0.6); opacity: 0; }
        }

        /* ── Fade in stagger ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .doc-back   { animation: stackFloat  3.8s ease-in-out infinite; }
        .doc-mid    { animation: stackFloat2 3.2s ease-in-out infinite 0.4s; }
        .doc-front  { animation: stackFloat3 4.2s ease-in-out infinite 0.2s; }
        .stamp-ring { animation: stampPulse  3s ease-in-out infinite; }
        .seal-outer { animation: sealSpin   18s linear infinite; }

        .scan-l1 { animation: scan 2.4s ease-in-out infinite 0.0s; }
        .scan-l2 { animation: scan 2.4s ease-in-out infinite 0.3s; }
        .scan-l3 { animation: scan 2.4s ease-in-out infinite 0.6s; }
        .scan-l4 { animation: scan 2.4s ease-in-out infinite 0.9s; }
        .scan-l5 { animation: scan 2.4s ease-in-out infinite 1.2s; }

        .check-path {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: checkDraw 0.7s ease-out forwards 1s;
        }

        .p1 { animation: drift1 2.8s ease-out infinite 0.0s; }
        .p2 { animation: drift2 3.2s ease-out infinite 0.6s; }
        .p3 { animation: drift3 2.5s ease-out infinite 1.1s; }
        .p4 { animation: drift1 3.6s ease-out infinite 1.8s; }
        .p5 { animation: drift2 2.9s ease-out infinite 0.3s; }

        .fade-up-1 { animation: fadeUp 0.6s ease-out forwards 0.1s; opacity: 0; }
        .fade-up-2 { animation: fadeUp 0.6s ease-out forwards 0.25s; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.6s ease-out forwards 0.4s; opacity: 0; }
      `}</style>

      {/* ── Decorative background geometry ── */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Large faint circle top-right */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border border-white/10" />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full border border-white/10" />
        {/* Bottom-left smear */}
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" />
        {/* Diagonal rule */}
        <div className="absolute top-0 left-0 w-full h-px bg-white/10" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row items-center lg:items-end gap-12 lg:gap-0 justify-between">
          {/* ── LEFT: Text content ── */}
          <div className="text-center lg:text-left space-y-4 lg:max-w-sm fade-up-1">
            <h2 className="text-2xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              Request Document with Ease.
              <span className="block text-white/60 text-sm font-semibold tracking-widest uppercase mt-1">
                Document Request System
              </span>
            </h2>
          </div>

          {/* ── CENTER: Document Animation ── */}
          <div className="relative flex items-center justify-center w-72 h-56 shrink-0 fade-up-2">
            {/* Floating particles */}
            <div className="absolute top-8 left-14 p1">
              <div className="w-2 h-2 rounded-full bg-white/30" />
            </div>
            <div className="absolute top-16 right-10 p2">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>
            <div className="absolute bottom-12 left-8 p3">
              <div className="w-1 h-1 rounded-full bg-white/40" />
            </div>
            <div className="absolute bottom-8 right-14 p4">
              <div className="w-2 h-2 rounded-full bg-white/20" />
            </div>
            <div className="absolute top-6 right-20 p5">
              <div className="w-1 h-1 rounded-full bg-white/30" />
            </div>

            {/* ── Back document ── */}
            <div
              className="doc-back absolute"
              style={{ top: "18px", left: "10px" }}
            >
              <svg width="110" height="140" viewBox="0 0 110 140" fill="none">
                {/* Body */}
                <rect
                  x="2"
                  y="2"
                  width="90"
                  height="116"
                  rx="6"
                  fill="white"
                  fillOpacity="0.08"
                  stroke="white"
                  strokeOpacity="0.2"
                  strokeWidth="1.5"
                />
                {/* Fold */}
                <path
                  d="M74 2 L92 20 L74 20 Z"
                  fill="white"
                  fillOpacity="0.1"
                />
                {/* Lines */}
                <rect
                  x="12"
                  y="32"
                  width="55"
                  height="4"
                  rx="2"
                  fill="white"
                  fillOpacity="0.15"
                />
                <rect
                  x="12"
                  y="44"
                  width="68"
                  height="4"
                  rx="2"
                  fill="white"
                  fillOpacity="0.1"
                />
                <rect
                  x="12"
                  y="56"
                  width="48"
                  height="4"
                  rx="2"
                  fill="white"
                  fillOpacity="0.1"
                />
                <rect
                  x="12"
                  y="68"
                  width="60"
                  height="4"
                  rx="2"
                  fill="white"
                  fillOpacity="0.1"
                />
                <rect
                  x="12"
                  y="80"
                  width="40"
                  height="4"
                  rx="2"
                  fill="white"
                  fillOpacity="0.1"
                />
              </svg>
            </div>

            {/* ── Mid document ── */}
            <div
              className="doc-mid absolute"
              style={{ top: "10px", left: "60px" }}
            >
              <svg width="110" height="140" viewBox="0 0 110 140" fill="none">
                <rect
                  x="2"
                  y="2"
                  width="90"
                  height="116"
                  rx="6"
                  fill="white"
                  fillOpacity="0.1"
                  stroke="white"
                  strokeOpacity="0.25"
                  strokeWidth="1.5"
                />
                <path
                  d="M74 2 L92 20 L74 20 Z"
                  fill="white"
                  fillOpacity="0.12"
                />
                <rect
                  x="12"
                  y="32"
                  width="42"
                  height="4"
                  rx="2"
                  fill="white"
                  fillOpacity="0.18"
                />
                <rect
                  x="12"
                  y="44"
                  width="60"
                  height="4"
                  rx="2"
                  fill="white"
                  fillOpacity="0.13"
                />
                <rect
                  x="12"
                  y="56"
                  width="52"
                  height="4"
                  rx="2"
                  fill="white"
                  fillOpacity="0.13"
                />
                <rect
                  x="12"
                  y="68"
                  width="38"
                  height="4"
                  rx="2"
                  fill="white"
                  fillOpacity="0.13"
                />
              </svg>
            </div>

            {/* ── Front document (main, animated lines + stamp) ── */}
            <div
              className="doc-front absolute"
              style={{ top: "4px", left: "34px" }}
            >
              <svg width="118" height="148" viewBox="0 0 118 148" fill="none">
                {/* Shadow */}
                <rect
                  x="6"
                  y="8"
                  width="96"
                  height="128"
                  rx="8"
                  fill="black"
                  fillOpacity="0.12"
                />
                {/* Body */}
                <rect
                  x="2"
                  y="2"
                  width="96"
                  height="128"
                  rx="8"
                  fill="white"
                  fillOpacity="0.18"
                  stroke="white"
                  strokeOpacity="0.5"
                  strokeWidth="1.5"
                />
                {/* Fold crease */}
                <path
                  d="M80 2 L98 22 L80 22 Z"
                  fill="white"
                  fillOpacity="0.25"
                  stroke="white"
                  strokeOpacity="0.3"
                  strokeWidth="1"
                />

                {/* Header bar */}
                <rect
                  x="12"
                  y="14"
                  width="60"
                  height="7"
                  rx="3.5"
                  fill="white"
                  fillOpacity="0.35"
                />

                {/* Animated scan lines */}
                <rect
                  className="scan-l1"
                  x="12"
                  y="34"
                  width="56"
                  height="4"
                  rx="2"
                  fill="white"
                  fillOpacity="0.8"
                />
                <rect
                  className="scan-l2"
                  x="12"
                  y="46"
                  width="72"
                  height="4"
                  rx="2"
                  fill="white"
                  fillOpacity="0.8"
                />
                <rect
                  className="scan-l3"
                  x="12"
                  y="58"
                  width="48"
                  height="4"
                  rx="2"
                  fill="white"
                  fillOpacity="0.8"
                />
                <rect
                  className="scan-l4"
                  x="12"
                  y="70"
                  width="64"
                  height="4"
                  rx="2"
                  fill="white"
                  fillOpacity="0.8"
                />
                <rect
                  className="scan-l5"
                  x="12"
                  y="82"
                  width="38"
                  height="4"
                  rx="2"
                  fill="white"
                  fillOpacity="0.8"
                />

                {/* Approval stamp circle */}
                <circle
                  cx="72"
                  cy="108"
                  r="18"
                  stroke="white"
                  strokeOpacity="0.5"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  fill="white"
                  fillOpacity="0.08"
                  className="stamp-ring"
                />
                <circle
                  cx="72"
                  cy="108"
                  r="13"
                  stroke="white"
                  strokeOpacity="0.4"
                  strokeWidth="1"
                  fill="none"
                />

                {/* Checkmark inside stamp */}
                <polyline
                  className="check-path"
                  points="64,108 70,114 80,102"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>

            {/* ── Rotating seal (bottom-right of scene) ── */}
            <div className="absolute bottom-0 right-4">
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                {/* Outer spinning ring with text dashes */}
                <g
                  className="seal-outer"
                  style={{ transformOrigin: "26px 26px" }}
                >
                  <circle
                    cx="26"
                    cy="26"
                    r="23"
                    stroke="white"
                    strokeOpacity="0.25"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                  />
                </g>
                <circle
                  cx="26"
                  cy="26"
                  r="17"
                  stroke="white"
                  strokeOpacity="0.3"
                  strokeWidth="1"
                  fill="white"
                  fillOpacity="0.06"
                />
                {/* Star / rosette center */}
                <path
                  d="M26 13 L28 22 L37 22 L30 27 L33 36 L26 31 L19 36 L22 27 L15 22 L24 22 Z"
                  fill="white"
                  fillOpacity="0.3"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[14px] text-white/80 font-medium">
            © {new Date().getFullYear()} Barangay Bonbon. All rights reserved.
          </p>
          <p className="text-[14px] text-white/80 font-medium">
            Cagayan De Oro, Philippines
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
