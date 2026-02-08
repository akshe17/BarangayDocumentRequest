import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Clock,
  Bell,
  UserCircle,
  LogOut,
  Menu,
  X,
  Shield,
  ShieldAlert,
} from "lucide-react";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

const ResidentLayout = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  // State for mobile sidebar toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user || !user.resident) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const { first_name, last_name, is_verified } = user.resident;
  const fullName = `${first_name} ${last_name}`;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* SIDE NAVIGATION - Mobile Toggle & Responsive Behavior */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white flex flex-col z-30 transition-transform duration-300 ease-in-out w-64 lg:w-64
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <img src={logo} alt="Logo" className="w-9 h-9 object-contain" />
            <div>
              <span className="text-emerald-600 font-bold text-md leading-none">
                Barangay Bonbon
              </span>
              <p className="text-gray-500 text-[0.6rem]  uppercase tracking-wider mt-0.5">
                Document Request System
              </p>
            </div>
          </div>
          {/* Close button inside sidebar for mobile */}
          <button className="lg:hidden" onClick={toggleSidebar}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          <NavItem
            to="/resident"
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            active={pathname === "/resident"}
            onClick={() => setIsSidebarOpen(false)} // Close sidebar on click
          />
          <NavItem
            to="/resident/new-request"
            icon={<FileText size={18} />}
            label="New Request"
            active={pathname === "/resident/new-request"}
            onClick={() => setIsSidebarOpen(false)}
          />
          <NavItem
            to="/resident/history"
            icon={<Clock size={18} />}
            label="My History"
            active={pathname === "/resident/history"}
            onClick={() => setIsSidebarOpen(false)}
          />
          <NavItem
            to="/resident/notifications"
            icon={<Bell size={18} />}
            label="Notifications"
            active={pathname === "/resident/notifications"}
            onClick={() => setIsSidebarOpen(false)}
          />
        </nav>

        <div className="p-4  space-y-1.5">
          <NavItem
            to="/resident/profile"
            icon={<UserCircle size={18} />}
            label="Profile"
            active={pathname === "/resident/profile"}
            onClick={() => setIsSidebarOpen(false)}
          />
          <NavItem
            to="/login"
            onClick={() => {
              logout();
              setIsSidebarOpen(false);
            }}
            icon={<LogOut size={18} />}
            label="Logout"
            color="text-red-500"
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* TOP NAVBAR */}
        <header className="h-14 bg-white flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* MOBILE VIEW: Name and Status on the LEFT */}
            <div className="lg:hidden flex flex-col">
              <p className="font-bold text-gray-950 text-xs truncate max-w-[150px]">
                {fullName}
              </p>
              {is_verified ? (
                <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-semibold uppercase tracking-wider">
                  <Shield size={10} />
                  Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-500 text-[10px] font-semibold uppercase tracking-wider">
                  <ShieldAlert size={10} />
                  Not Verified
                </span>
              )}
            </div>

            {/* Title for desktop */}
            <h2 className="hidden lg:block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]"></h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggler button for mobile on the RIGHT: Switches between Menu and X */}
            <button className="lg:hidden text-gray-500" onClick={toggleSidebar}>
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* DESKTOP VIEW: Name and Status */}
            <div className="text-right hidden lg:block">
              <p className="text-[10px] font-black text-gray-900 leading-none">
                {fullName}
              </p>
              {is_verified ? (
                <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-1">
                  Verified
                </p>
              ) : (
                <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest mt-1">
                  Not Verified
                </p>
              )}
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

const NavItem = ({
  to,
  icon,
  label,
  active,
  color = "text-gray-500",
  onClick,
}) => {
  const handleClick = (e) => {
    if (onClick) {
      onClick(); // Execute specific mobile closing logic
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
        active
          ? "bg-emerald-500 text-white shadow-sm shadow-emerald-100/50"
          : `${color} hover:bg-gray-200 hover:text-gray-700`
      }`}
    >
      <span className={`${active ? "text-white" : " text-gray-500"}`}>
        {icon}
      </span>
      <span className="text-xs font-poppins font-bold uppercase tracking-tight">
        {label}
      </span>
    </Link>
  );
};

export default ResidentLayout;
