import React from "react";
import { Search, Eye, Check, X } from "lucide-react";

const RequestTable = () => {
  const requests = [
    {
      id: "REQ-001",
      resident: "Juan Luna",
      doc: "Indigency",
      date: "2 mins ago",
      status: "Pending",
    },
    {
      id: "REQ-002",
      resident: "Andres Bonifacio",
      doc: "Clearance",
      date: "1 hour ago",
      status: "In Progress",
    },
  ];

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white">
        <div className="relative w-72">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
            placeholder="Search requests..."
          />
        </div>
        <div className="flex gap-2">
          {["All", "Pending", "Approved"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${tab === "Pending" ? "bg-emerald-500 text-white shadow-md shadow-emerald-100" : "text-gray-400 hover:bg-gray-50"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                Resident
              </th>
              <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                Document
              </th>
              <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                Status
              </th>
              <th className="px-8 py-4 text-center text-[10px] font-black uppercase text-gray-400 tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {requests.map((req) => (
              <tr
                key={req.id}
                className="hover:bg-emerald-50/10 transition-colors group"
              >
                <td className="px-8 py-6">
                  <p className="font-bold text-gray-800">{req.resident}</p>
                  <p className="text-xs text-gray-400">{req.date}</p>
                </td>
                <td className="px-8 py-6 font-semibold text-emerald-700">
                  {req.doc}
                </td>
                <td className="px-8 py-6">
                  <span
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${
                      req.status === "Pending"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition">
                      <Check size={16} />
                    </button>
                    <button className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-500 hover:text-white transition">
                      <X size={16} />
                    </button>
                    <button className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-900 hover:text-white transition">
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestTable;
