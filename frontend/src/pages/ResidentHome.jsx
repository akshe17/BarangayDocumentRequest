import React, { useState } from "react";
import {
  FileText,
  Clock,
  Bell,
  User,
  ChevronRight,
  LayoutDashboard,
  Settings,
  LogOut,
  PlusCircle,
  HelpCircle,
} from "lucide-react";
import logo from "../assets/logo.png";

const ResidentHome = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const recentRequests = [
    {
      id: "REQ-001",
      type: "Barangay Clearance",
      status: "Ready for Pickup",
      date: "Jan 28",
    },
    {
      id: "REQ-002",
      type: "Certificate of Indigency",
      status: "Processing",
      date: "Jan 30",
    },
  ];

  return (
    <div
      className="flex min-h-screen bg-gray-50 font-sans"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* SIDE NAVIGATION */}
      <aside className="w-20 lg:w-64 bg-white border-r border-gray-100 flex flex-col transition-all">
        <div className="p-6 flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
          <span className="hidden lg:block font-black text-gray-900 tracking-tighter text-sm uppercase">
            Brgy Connect
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />
          <NavItem
            icon={<FileText size={18} />}
            label="New Request"
            active={activeTab === "request"}
            onClick={() => setActiveTab("request")}
          />
          <NavItem
            icon={<Clock size={18} />}
            label="My History"
            active={activeTab === "history"}
            onClick={() => setActiveTab("history")}
          />
          <NavItem
            icon={<Bell size={18} />}
            label="Notifications"
            active={activeTab === "notifs"}
            onClick={() => setActiveTab("notifs")}
          />
        </nav>

        <div className="p-4 border-t border-gray-50 space-y-2">
          <NavItem icon={<Settings size={18} />} label="Settings" />
          <NavItem
            icon={<LogOut size={18} />}
            label="Logout"
            color="text-red-500"
          />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
            Resident Dashboard
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-black text-gray-900 leading-none">
                Maria Clara
              </p>
              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">
                Verified Resident
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs border border-emerald-200">
              MC
            </div>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto space-y-8">
          {/* WELCOME HERO */}
          <div className="bg-emerald-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-100">
            <div className="relative z-10">
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight mb-2">
                Good morning, Maria!
              </h1>
              <p className="text-emerald-50 text-xs font-medium opacity-80 max-w-sm">
                Need a document? You can now request clearances and permits
                without leaving your home.
              </p>
              <button className="mt-6 bg-white text-emerald-600 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-emerald-50 transition-all flex items-center gap-2">
                <PlusCircle size={14} /> Create New Request
              </button>
            </div>
            {/* Abstract background shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl"></div>
          </div>

          {/* QUICK STATS / INFO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={<Clock className="text-amber-500" />}
              label="Ongoing Requests"
              value="2"
            />
            <StatCard
              icon={<FileText className="text-blue-500" />}
              label="Approved Documents"
              value="12"
            />
            <StatCard
              icon={<HelpCircle className="text-emerald-500" />}
              label="Support Tickets"
              value="0"
            />
          </div>

          {/* RECENT ACTIVITY TABLE */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
                Recent Requests
              </h3>
              <button className="text-[10px] font-bold text-emerald-600 hover:underline">
                View All
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">
                        {req.type}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        Reference: {req.id} • {req.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter ${
                        req.status === "Ready for Pickup"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {req.status}
                    </span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

// HELPER COMPONENTS
const NavItem = ({ icon, label, active, onClick, color = "text-gray-500" }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
      active ? "bg-emerald-50 text-emerald-600" : `${color} hover:bg-gray-50`
    }`}
  >
    <span
      className={`${active ? "text-emerald-600" : "opacity-70 group-hover:opacity-100"}`}
    >
      {icon}
    </span>
    <span className={`text-[11px] font-bold tracking-tight hidden lg:block`}>
      {label}
    </span>
  </button>
);

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
        {label}
      </p>
      <p className="text-xl font-black text-gray-900">{value}</p>
    </div>
  </div>
);

export default ResidentHome;
