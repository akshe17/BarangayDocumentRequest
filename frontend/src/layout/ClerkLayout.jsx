import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ClipboardList, // New: For Pending
  Truck, // New: For Pickup
  Users, // New: For Directory
  History,
  UserCog,
  CheckCircle,
} from "lucide-react";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

const ClerkLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      path: "/clerk/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: "/clerk/pending",
      label: "Incoming Queue",
      icon: <ClipboardList size={20} />,
    },
    {
      path: "/clerk/pickup",
      label: "Ready for Pickup",
      icon: <Truck size={20} />,
    },
    {
      path: "/clerk/completed",
      label: "Completed",
      icon: <CheckCircle size={20} />,
    },
    {
      path: "/clerk/residents",
      label: "Resident Directory",
      icon: <Users size={20} />,
    },
    {
      path: "/clerk/logs",
      label: "Audit Logs",
      icon: <History size={20} />,
    },
  ];

  const currentPage = menuItems.find((m) => m.path === location.pathname);

  return (
    <div className="flex h-screen bg-gray-50">
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300`}
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-white font-bold text-sm leading-tight">
                  BRGY BONBON
                </h1>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Clerk Portal
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

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700 space-y-2">
          <Link
            to="/clerk/profile"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg ${location.pathname === "/clerk/profile" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
          >
            <UserCog size={18} />
            <span className="text-sm">Profile</span>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="md:hidden text-gray-600 p-2"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold text-gray-900">
              {currentPage?.label || "Portal"}
            </h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClerkLayout;
