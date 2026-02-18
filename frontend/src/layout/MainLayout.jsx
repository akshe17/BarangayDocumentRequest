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
  Package,
} from "lucide-react";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

const MainLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      path: "/dashboard",
      label: "Overview",
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: "/dashboard/users-staff",
      label: "Manage Staffs",
      icon: <Users size={20} />,
    },
    {
      path: "/dashboard/residents",
      label: "Manage Resident",
      icon: <Users size={20} />,
    },
    {
      path: "/dashboard/requests",
      label: "Requests",
      icon: <FileText size={20} />,
    },
    {
      path: "/dashboard/documents",
      label: "Documents",
      icon: <Package size={20} />,
    },
    {
      path: "/dashboard/logs",
      label: "Audit Logs",
      icon: <History size={20} />,
    },
  ];

  // Logic to determine active state
  const isProfileActive = location.pathname.startsWith("/dashboard/profile");
  const currentPage = menuItems.find((m) => m.path === location.pathname);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* MOBILE BACKDROP */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col
          md:relative md:translate-x-0 
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* BRANDING SECTION */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <img
                  src={logo}
                  alt="Brgy Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-white font-bold text-sm">BRGY BONBON</h1>
                <p className="text-xs text-emerald-400 uppercase">
                  Admin Portal
                </p>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm
                  ${
                    isActive
                      ? "bg-emerald-500 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* PROFILE SETTINGS & LOGOUT */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          {/* PROFILE SETTINGS LINK */}
          <Link
            to="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg text-sm
              ${
                isProfileActive
                  ? "bg-emerald-500 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }
            `}
          >
            <Settings size={18} />
            <span>Profile Settings</span>
          </Link>

          {/* LOGOUT BUTTON */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="md:hidden text-gray-600 hover:bg-gray-100 rounded-lg p-2"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {isProfileActive
                ? "Profile Settings"
                : currentPage?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-3"></div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
