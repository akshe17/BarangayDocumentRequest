import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Clock,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";


const ResidentLayout = () => {
  const { pathname } = useLocation();

  return (
    <div
      className="flex min-h-screen bg-gray-50 font-sans"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* SIDE NAVIGATION */}
      <aside className="w-20 lg:w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
            B
          </div>
          <span className="hidden lg:block font-black text-gray-900 tracking-tighter text-xs uppercase">
            Brgy Connect
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          <NavItem
            to="/resident"
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            active={pathname === "/resident"}
          />
          <NavItem
            to="/resident/new-request"
            icon={<FileText size={18} />}
            label="New Request"
            active={pathname === "/resident/new-request"}
          />
          <NavItem
            to="/resident/history"
            icon={<Clock size={18} />}
            label="My History"
            active={pathname === "/resident/history"}
          />
          <NavItem
            to="/resident/notifications"
            icon={<Bell size={18} />}
            label="Notifications"
            active={pathname === "/resident/notifications"}
          />
        </nav>

        <div className="p-4 border-t border-gray-50 space-y-1.5">
          <NavItem
            to="/resident/settings"
            icon={<Settings size={18} />}
            label="Settings"
            active={pathname === "/resident/settings"}
          />
          <NavItem
            to="/login"
            icon={<LogOut size={18} />}
            label="Logout"
            color="text-red-500"
          />
        </div>
      </aside>

      {/* MAIN WRAPPER */}
      <div className="flex-1 ml-20 lg:ml-64 flex flex-col">
        {/* TOP NAVBAR */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Resident Portal
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-gray-900 leading-none">
                Maria Clara
              </p>
              <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-1">
                Verified
              </p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-[10px] border border-emerald-200">
              MC
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="p-6 lg:p-10 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label, active, color = "text-gray-400" }) => (
  <Link
    to={to}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
      active
        ? "bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100/50"
        : `${color} hover:bg-gray-50 hover:text-gray-600`
    }`}
  >
    <span
      className={`${active ? "text-emerald-600" : "opacity-70 group-hover:opacity-100"}`}
    >
      {icon}
    </span>
    <span className="text-[10px] font-black uppercase tracking-tight hidden lg:block">
      {label}
    </span>
  </Link>
);

export default ResidentLayout;
