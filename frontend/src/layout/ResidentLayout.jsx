import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  SearchCheck,
  Clock,
  UserCircle,
  LogOut,
  Menu,
  X,
  Shield,
  ShieldAlert,
  ChevronDown,
} from "lucide-react";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { to: "/resident", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/resident/new-request", icon: FileText, label: "New Request" },
  { to: "/resident/history", icon: SearchCheck, label: "Track Request" },
  { to: "/resident/notifications", icon: Clock, label: "My History" },
];

const ResidentLayout = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  if (!user || !user.resident) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium tracking-wide">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  const { first_name, last_name } = user;
  const isVerified = user.resident?.is_verified ?? user.is_verified;
  const fullName = `${first_name} ${last_name}`;
  const initials =
    `${first_name?.[0] ?? ""}${last_name?.[0] ?? ""}`.toUpperCase();

  const isActive = (to, exact) =>
    exact
      ? pathname === to
      : pathname.startsWith(to) && to !== "/resident"
        ? true
        : pathname === to;

  return (
    <div className="min-h-screen bg-[#f8faf9] font-sans flex flex-col">
      {/* ── TOP NAVBAR ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-14 flex items-center justify-between gap-6">
          {/* LOGO */}
          <Link
            to="/resident"
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <img src={logo} alt="Logo" className="w-5 h-5 object-contain" />
            </div>
            <div className="hidden sm:block leading-none">
              <p className="text-[13px] font-black text-emerald-600 tracking-tight">
                Barangay Bonbon
              </p>
              <p className="text-[9px] text-gray-400 uppercase tracking-[0.15em] font-medium mt-px">
                Doc Request System
              </p>
            </div>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ to, icon: Icon, label, exact }) => {
              const active = exact ? pathname === to : pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-150 ${
                    active
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={14} strokeWidth={active ? 2.5 : 2} />
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-emerald-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Profile Dropdown + Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            {/* PROFILE DROPDOWN (desktop) */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                {/* Avatar */}
                <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-[10px] font-black">
                  {initials}
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-black text-gray-800 leading-none">
                    {fullName}
                  </p>
                  {isVerified ? (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-500 uppercase tracking-wider mt-0.5">
                      <Shield size={8} strokeWidth={3} /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-red-400 uppercase tracking-wider mt-0.5">
                      <ShieldAlert size={8} strokeWidth={3} /> Not Verified
                    </span>
                  )}
                </div>
                <ChevronDown
                  size={12}
                  className={`text-gray-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl border border-gray-100 shadow-lg shadow-gray-200/60 z-20 overflow-hidden">
                    <Link
                      to="/resident/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors uppercase tracking-wider"
                    >
                      <UserCircle size={14} /> Profile
                    </Link>
                    <div className="border-t border-gray-100" />
                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-bold text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors uppercase tracking-wider"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* MOBILE MENU TOGGLE */}
            <button
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* MOBILE DROPDOWN MENU */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {/* User Info */}
            <div className="flex items-center gap-3 px-3 py-2.5 mb-2 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-[11px] font-black">
                {initials}
              </div>
              <div>
                <p className="text-[12px] font-black text-gray-800">
                  {fullName}
                </p>
                {isVerified ? (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-500 uppercase tracking-wider">
                    <Shield size={8} strokeWidth={3} /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-red-400 uppercase tracking-wider">
                    <ShieldAlert size={8} strokeWidth={3} /> Not Verified
                  </span>
                )}
              </div>
            </div>

            {/* Nav Links */}
            {NAV_LINKS.map(({ to, icon: Icon, label, exact }) => {
              const active = exact ? pathname === to : pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    active
                      ? "bg-emerald-500 text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={15} strokeWidth={2} />
                  {label}
                </Link>
              );
            })}

            <div className="border-t border-gray-100 pt-1 mt-1">
              <Link
                to="/resident/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <UserCircle size={15} /> Profile
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* PAGE CONTENT */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 lg:px-10 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ResidentLayout;
