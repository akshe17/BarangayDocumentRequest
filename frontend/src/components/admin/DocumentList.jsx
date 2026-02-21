import React from "react";
import { Plus, Search, X, FileText, Loader2, AlertCircle } from "lucide-react";
import DocumentCard from "./DocumentCard";

const DocumentList = ({
  documentTypes,
  loadingList,
  listError,
  search,
  setSearch,
  filter,
  setFilter,
  filteredDocs,
  onEdit,
  onToggleStatus,
  onOpenFile,
  onNew,
  onRetry,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-start sm:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Document Types
          </h1>
          <p className="text-sm text-gray-400 mt-1 hidden sm:block">
            Configure requirements and fees for barangay services.
          </p>
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 sm:gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-colors shadow-sm shrink-0"
        >
          <Plus size={17} />
          <span className="hidden sm:inline">New Template</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row bg-white rounded-xl shadow-sm border border-gray-100 p-3 gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 self-stretch sm:self-auto">
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "inactive", label: "Inactive" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex-1 sm:flex-none px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === key
                  ? key === "inactive"
                    ? "bg-red-50 text-red-500"
                    : key === "active"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-white text-gray-700 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loadingList && (
        <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Loading document types…</span>
        </div>
      )}

      {/* Error */}
      {listError && !loadingList && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertCircle size={20} className="text-red-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">
            Failed to load documents
          </p>
          <p className="text-xs text-gray-400 max-w-xs">{listError}</p>
          <button
            onClick={onRetry}
            className="mt-1 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Cards */}
      {!loadingList && !listError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredDocs.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                <FileText size={20} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-400">
                No documents found
              </p>
              <p className="text-xs text-gray-300 mt-1">
                Try adjusting your search or filter
              </p>
            </div>
          )}

          {filteredDocs.map((doc, idx) => (
            <DocumentCard
              key={doc.document_id}
              doc={doc}
              idx={idx}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              onOpenFile={onOpenFile}
            />
          ))}

          {filter === "all" && !search && (
            <button
              onClick={onNew}
              className="group border-2 border-dashed border-gray-200 rounded-2xl p-5 sm:p-6 min-h-[180px] sm:min-h-[220px] flex flex-col items-center justify-center gap-3 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-300 group-hover:border-emerald-400 group-hover:text-emerald-500 transition-all">
                <Plus size={20} />
              </div>
              <span className="text-sm font-medium text-gray-400 group-hover:text-emerald-600 transition-colors">
                Add Document Type
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentList;
