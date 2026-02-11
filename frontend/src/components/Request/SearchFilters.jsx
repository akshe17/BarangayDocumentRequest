import React from "react";
import { Search } from "lucide-react";

const SearchFilters = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  stats,
}) => {
  const filterButtons = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending", badge: stats.pending },
    { label: "Approved", value: "approved" },
    { label: "Completed", value: "completed" },
    { label: "Rejected", value: "rejected" },
  ];

  const getButtonClass = (value) => {
    const baseClass = "px-4 py-2 rounded-lg text-xs font-bold transition-all";
    const colors = {
      all: "bg-white text-gray-900 shadow-sm",
      pending: "bg-white text-amber-600 shadow-sm",
      approved: "bg-white text-blue-600 shadow-sm",
      completed: "bg-white text-emerald-600 shadow-sm",
      rejected: "bg-white text-red-600 shadow-sm",
    };

    if (filterStatus === value) {
      return `${baseClass} ${colors[value]}`;
    }
    return `${baseClass} text-gray-500 hover:text-gray-700`;
  };

  return (
    <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-gray-50 to-white">
      <div className="relative w-full md:w-96">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
          placeholder="Search by resident, document, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
          {filterButtons.map((button) => (
            <button
              key={button.value}
              onClick={() => setFilterStatus(button.value)}
              className={`${getButtonClass(button.value)} relative`}
            >
              {button.label}
              {button.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {button.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
