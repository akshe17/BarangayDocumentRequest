import React, { useState, useEffect } from "react";
// 1. Import your API instance (assuming you have axios configured)
import api from "../../axious/api";
import {
  Bell,
  CheckCircle2,
  XCircle,
  UserCheck,
  UserPlus,
  Clock,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";

const ResidentNotifications = () => {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Fetch data from Laravel backend on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Replace with your Laravel API endpoint
      const response = await api.get("/resident/notifications");
      setNotifications(response.data);
    } catch (err) {
      setError("Failed to fetch notifications. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      // API call to update status in DB
      await api.put(`/resident/notifications/${id}/read`);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, status: "read" } : n)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotif = async (id) => {
    try {
      // API call to delete from DB
      await api.delete(`/resident/notifications/${id}`);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.category === filter);

  // Helper to determine styling based on notification type
  const getStyles = (type) => {
    switch (type) {
      case "REQUEST_APPROVED":
        return {
          icon: <CheckCircle2 size={20} />,
          bg: "bg-emerald-50",
          text: "text-emerald-600",
          border: "border-emerald-100",
        };
      case "REQUEST_REJECTED":
        return {
          icon: <XCircle size={20} />,
          bg: "bg-red-50",
          text: "text-red-600",
          border: "border-red-100",
        };
      case "ACCOUNT_VERIFIED":
        return {
          icon: <UserCheck size={20} />,
          bg: "bg-blue-50",
          text: "text-blue-600",
          border: "border-blue-100",
        };
      case "ACCOUNT_UNVERIFIED":
        return {
          icon: <UserPlus size={20} />,
          bg: "bg-amber-50",
          text: "text-amber-600",
          border: "border-amber-100",
        };
      default:
        return {
          icon: <Clock size={20} />,
          bg: "bg-gray-50",
          text: "text-gray-400",
          border: "border-gray-100",
        };
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-950 tracking-tighter">
            Activity Hub
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time updates on your account and requests.
          </p>
        </div>
        <div className="relative p-3 bg-gray-50 rounded-full border border-gray-100">
          <Bell size={24} className="text-gray-400" />
          {notifications.some((n) => n.status === "unread") && (
            <span className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          )}
        </div>
      </div>

      {/* INTERACTIVE FILTERS */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {["all", "requests", "account"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold capitalize transition-all duration-300 ${
              filter === type
                ? "bg-gray-900 text-white shadow-lg"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* NOTIFICATION LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-gray-500 flex justify-center items-center gap-2">
            <Loader2 className="animate-spin" size={20} /> Loading your
            notifications...
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-600 bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center">
            <AlertCircle className="mb-2" size={30} /> {error}
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((notif) => (
            <div
              key={notif.id}
              className={`group relative bg-white rounded-2xl border transition-all duration-300 ${
                notif.status === "unread"
                  ? "border-emerald-100 shadow-sm"
                  : "border-gray-100 opacity-90 hover:opacity-100"
              } hover:shadow-lg hover:-translate-y-0.5`}
            >
              <div className="p-5 flex items-start gap-4">
                {/* DYNAMIC ICON */}
                <div
                  className={`p-3.5 rounded-xl transition-transform duration-500 group-hover:scale-105 ${getStyles(notif.type).bg} ${getStyles(notif.type).text} ${getStyles(notif.type).border} border`}
                >
                  {getStyles(notif.type).icon}
                </div>

                {/* TEXT CONTENT */}
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3
                      className={`text-[15px] font-semibold ${notif.status === "unread" ? "text-gray-950" : "text-gray-700"}`}
                    >
                      {notif.title}
                    </h3>
                    <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap">
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1.5 font-medium leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {/* INTERACTIVE ACTIONS */}
                <div className="flex gap-1.5 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {notif.status === "unread" && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="p-2.5 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors"
                      title="Mark as read"
                    >
                      <Check size={17} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotif(notif.id)}
                    className="p-2.5 hover:bg-red-50 text-red-500 rounded-xl transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                {/* UNREAD INDICATOR */}
                {notif.status === "unread" && (
                  <div className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center bg-white rounded-3xl border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-100">
              <Bell size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              All caught up!
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
              There are no new notifications in this category right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentNotifications;
