import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  XCircle,
  UserCheck,
  UserPlus,
  Clock,
  ChevronRight,
  Trash2,
  Check,
} from "lucide-react";

const ResidentNotifications = () => {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "REQUEST_APPROVED",
      title: "Document Approved",
      message: "Your Barangay Clearance (REQ-8821) is ready for pickup.",
      time: "2 mins ago",
      status: "unread",
      category: "requests",
    },
    {
      id: 2,
      type: "ACCOUNT_VERIFIED",
      title: "Account Verified",
      message: "Your identity has been confirmed. You now have full access.",
      time: "1 hour ago",
      status: "unread",
      category: "account",
    },
    {
      id: 3,
      type: "REQUEST_REJECTED",
      title: "Request Rejected",
      message: "Business Permit (REQ-5501) rejected. Reason: Missing DTI.",
      time: "Yesterday",
      status: "read",
      category: "requests",
    },
  ]);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, status: "read" } : n)),
    );
  };

  const deleteNotif = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const filtered =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.category === filter);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Activity
          </h1>
          <p className="text-sm text-gray-500">
            Updates on your account and requests.
          </p>
        </div>
        <div className="relative">
          <Bell size={24} className="text-gray-300" />
          {notifications.some((n) => n.status === "unread") && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          )}
        </div>
      </div>

      {/* INTERACTIVE FILTERS */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {["all", "requests", "account"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-5 py-2 rounded-full text-xs font-semibold capitalize transition-all duration-300 ${
              filter === type
                ? "bg-gray-900 text-white shadow-lg"
                : "bg-white text-gray-400 border border-gray-100 hover:border-gray-300"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* NOTIFICATION LIST */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((notif) => (
            <div
              key={notif.id}
              className={`group relative overflow-hidden bg-white rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                notif.status === "unread"
                  ? "border-emerald-100 shadow-sm shadow-emerald-50"
                  : "border-gray-100 opacity-90"
              }`}
            >
              <div className="p-5 flex items-start gap-4">
                {/* DYNAMIC ICON */}
                <div
                  className={`p-3 rounded-xl transition-transform duration-500 group-hover:scale-110 ${getStyles(notif.type).bg} ${getStyles(notif.type).text}`}
                >
                  {getStyles(notif.type).icon}
                </div>

                {/* TEXT CONTENT */}
                <div className="flex-1" onClick={() => markAsRead(notif.id)}>
                  <div className="flex justify-between items-start">
                    <h3
                      className={`text-[15px] font-semibold ${notif.status === "unread" ? "text-gray-900" : "text-gray-600"}`}
                    >
                      {notif.title}
                    </h3>
                    <span className="text-[10px] font-medium text-gray-400">
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 font-medium leading-relaxed italic group-hover:not-italic transition-all">
                    {notif.message}
                  </p>
                </div>

                {/* INTERACTIVE ACTIONS */}
                <div className="flex flex-col gap-2 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => deleteNotif(notif.id)}
                    className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {notif.status === "unread" && (
                  <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Bell size={24} className="text-gray-200" />
            </div>
            <p className="text-sm font-medium text-gray-400">
              Nothing to see here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const getStyles = (type) => {
  switch (type) {
    case "REQUEST_APPROVED":
      return {
        icon: <CheckCircle2 size={20} />,
        bg: "bg-emerald-50",
        text: "text-emerald-600",
      };
    case "REQUEST_REJECTED":
      return {
        icon: <XCircle size={20} />,
        bg: "bg-red-50",
        text: "text-red-600",
      };
    case "ACCOUNT_VERIFIED":
      return {
        icon: <UserCheck size={20} />,
        bg: "bg-blue-50",
        text: "text-blue-600",
      };
    case "ACCOUNT_UNVERIFIED":
      return {
        icon: <UserPlus size={20} />,
        bg: "bg-amber-50",
        text: "text-amber-600",
      };
    default:
      return {
        icon: <Clock size={20} />,
        bg: "bg-gray-50",
        text: "text-gray-400",
      };
  }
};

export default ResidentNotifications;
