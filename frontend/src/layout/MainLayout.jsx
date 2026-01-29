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
  Bell,
  ChevronDown,
  Package,
} from "lucide-react";
import logo from "../assets/logo.png";

const MainLayout = ({ onLogout }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      path: "/dashboard",
      label: "Overview",
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: "/dashboard/residents",
      label: "Residents",
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
    {
      path: "/dashboard/settings",
      label: "Settings",
      icon: <Settings size={20} />,
    },
  ];

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
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
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
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  ${
                    isActive
                      ? "bg-emerald-500 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }
                `}
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ADMIN INFO & LOGOUT */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onLogout}
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
              {currentPage?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button className="text-gray-600 hover:bg-gray-100 rounded-lg p-2">
              <Bell size={20} />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
                  AB
                </div>
                <ChevronDown size={16} className="text-gray-500" />
              </button>

              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-3">
                      <Link
                        to="/dashboard/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                      >
                        <Settings size={16} />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
