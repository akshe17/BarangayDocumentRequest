import React from "react";
import { Activity, Terminal } from "lucide-react";

const AuditLogs = () => {
  const logs = [
    {
      id: 1,
      action: "Approved Business Permit",
      user: "Admin Mark",
      time: "10:24 AM",
      date: "Jan 28, 2026",
    },
    {
      id: 2,
      action: "Updated Document Price",
      user: "Admin Sarah",
      time: "09:15 AM",
      date: "Jan 28, 2026",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-100">
          <Terminal size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800">System Activity</h2>
          <p className="text-gray-500">
            Real-time logs of all administrative actions.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {logs.map((log) => (
          <div
            key={log.id}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-2 h-12 bg-emerald-100 rounded-full group-hover:bg-emerald-500 transition-colors"></div>
              <div>
                <p className="text-sm font-bold text-gray-800">{log.action}</p>
                <p className="text-xs text-gray-400">
                  Performed by{" "}
                  <span className="text-emerald-600 font-semibold">
                    {log.user}
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-800">{log.time}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                {log.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditLogs;
