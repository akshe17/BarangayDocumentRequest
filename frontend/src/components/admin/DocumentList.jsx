import React from "react";
import { Plus, Search, X, FileText } from "lucide-react";
import DocumentCard from "./DocumentCard";

const DocumentList = ({
  documentTypes,
  loadingList,
  listError,
  search,
  setSearch,
  filter,
  setFilter,
  handlerFilter,
  setHandlerFilter,
  filteredDocs,
  onEdit,
  onOpenFile,
  onNew,
  onRetry,
  onDisable, // opens disable/enable confirm modal
  onDelete, // opens delete confirm modal
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* ── Header ── */}
      <div className="flex items-start sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Document Types
          </h1>
          <p className="text-sm text-slate-400 mt-0.5 hidden sm:block">
            Configure requirements and fees for barangay services.
          </p>
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white
                     text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shrink-0"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">New Template</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* ── Search + Filters ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-3 flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={13}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents…"
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700
                       placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 self-stretch sm:self-auto">
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "inactive", label: "Disabled" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all
                ${
                  filter === key
                    ? key === "inactive"
                      ? "bg-amber-50 text-amber-700 shadow-sm"
                      : key === "active"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-white text-slate-700 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Handler filter */}
        {setHandlerFilter && (
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 self-stretch sm:self-auto">
            {[
              { key: "all", label: "All" },
              { key: "clerk", label: "Clerk" },
              { key: "zone", label: "Zone Leader" },
              { key: "unassigned", label: "Unassigned" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setHandlerFilter(key)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                  ${
                    handlerFilter === key
                      ? "bg-white text-slate-700 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Error ── */}
      {listError && !loadingList && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
            <FileText size={18} className="text-rose-400" />
          </div>
          <p className="text-sm font-bold text-slate-500">
            Failed to load documents
          </p>
          <p className="text-xs text-slate-400 max-w-xs">{listError}</p>
          <button
            onClick={onRetry}
            className="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Cards grid ── */}
      {!loadingList && !listError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <FileText size={18} className="text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400">
                No documents found
              </p>
              <p className="text-xs text-slate-300 mt-1">
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
              onOpenFile={onOpenFile}
              onDisable={onDisable}
              onDelete={onDelete}
            />
          ))}

          {/* Add new — only show when not filtered */}
          {filter === "all" && !search && (
            <button
              onClick={onNew}
              className="group border-2 border-dashed border-slate-200 rounded-2xl p-5 min-h-[200px]
                         flex flex-col items-center justify-center gap-3
                         hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-200"
            >
              <div
                className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center
                              text-slate-300 group-hover:border-emerald-400 group-hover:text-emerald-500 transition-all"
              >
                <Plus size={18} />
              </div>
              <span className="text-sm font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                Add Document Type
              </span>
            </button>
          )}
        </div>
      )}

      {/* Row count */}
      {!loadingList && !listError && filteredDocs.length > 0 && (
        <p className="text-[11px] text-slate-300 text-right font-mono mt-4">
          {filteredDocs.length} of {documentTypes.length} document
          {documentTypes.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
};

export default DocumentList;
