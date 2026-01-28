import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  History,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";
import logo from "../assets/logo.png";
const MainLayout = ({ onLogout }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      path: "/dashboard",
      label: "Overview",
      icon: <LayoutDashboard size={18} />,
    },
    {
      path: "/dashboard/requests",
      label: "Requests",
      icon: <FileText size={18} />,
    },
    {
      path: "/dashboard/residents",
      label: "Residents",
      icon: <Users size={18} />,
    },
    { path: "/dashboard/logs", label: "Logs", icon: <History size={18} /> },
    {
      path: "/dashboard/settings",
      label: "Settings",
      icon: <Settings size={18} />,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* MOBILE BACKDROP */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-black text-white flex flex-col transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* BRANDING SECTION */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9  rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <img
                src={logo}
                alt="Brgy Logo"
                className="w-full h-full object-contain filter drop-shadow-md"
              />
            </div>
            <div>
              <h1 className="text-white font-black text-xs leading-none tracking-tight">
                BRGY BONBON
              </h1>
              <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest mt-1">
                Admin Portal
              </p>
            </div>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/10 font-bold"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <span
                  className={
                    isActive
                      ? "text-white"
                      : "text-emerald-500 group-hover:text-emerald-400"
                  }
                >
                  {item.icon}
                </span>
                {/* SMALLER TEXT LABEL */}
                <span className="text-[13px] tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* LOGOUT AT THE VERY BOTTOM */}
        <div className="p-4 mt-auto border-t border-white/5 bg-black">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all font-bold"
          >
            <LogOut size={18} />
            <span className="text-xs tracking-widest uppercase">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 md:h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-600 md:hidden hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-lg font-black text-gray-800 tracking-tight capitalize">
                {menuItems.find((m) => m.path === location.pathname)?.label ||
                  "Overview"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <p className="text-xs font-black text-gray-900 leading-none">
                Admin Bonbon
              </p>
              <p className="text-[9px] font-bold text-emerald-600 uppercase mt-1 italic">
                Active Session
              </p>
            </div>
            <div className="w-10 h-10 bg-black text-emerald-400 rounded-xl flex items-center justify-center font-black shadow-md">
              B
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-8 bg-[#FBFBFB]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
