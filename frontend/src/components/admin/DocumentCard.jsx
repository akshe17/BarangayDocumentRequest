import React from "react";
import {
  FileText,
  Sparkles,
  ChevronRight,
  Paperclip,
  ExternalLink,
} from "lucide-react";

const ICONS = [FileText, Sparkles, FileText, Sparkles];

const DocumentCard = ({ doc, idx, onEdit, onToggleStatus, onOpenFile }) => {
  const Icon = ICONS[idx % ICONS.length];
  const isActive = !!doc.in_use;
  const reqCount = doc.requirements?.length ?? 0;
  const fieldCount = doc.form_fields?.length ?? 0;
  const hasFile = !!doc.template_path;

  return (
    <div
      onClick={() => onEdit(doc)}
      className="group bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-5 sm:mb-6">
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
            isActive
              ? "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          <Icon size={19} />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus(e, doc);
          }}
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-all hover:opacity-75 active:scale-95 ${
            isActive
              ? "text-emerald-600 bg-emerald-50"
              : "text-red-400 bg-red-50"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </button>
      </div>

      <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 leading-snug">
        {doc.document_name}
      </h3>
      <p className="text-sm text-gray-400">
        Fee: ₱ {parseFloat(doc.fee || 0).toFixed(2)}
      </p>

      <div className="mt-5 sm:mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
        <div className="flex gap-4 sm:gap-5 flex-wrap">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
              Requirements
            </p>
            <p className="text-sm font-medium text-gray-600 mt-0.5">
              {reqCount} {reqCount === 1 ? "item" : "items"}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
              Additional Form Fields
            </p>
            <p className="text-sm font-medium text-gray-600 mt-0.5">
              {fieldCount} {fieldCount === 1 ? "field" : "fields"}
            </p>
          </div>
          {hasFile && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
                Template
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenFile(doc);
                }}
                className="text-sm font-medium cursor-pointer text-emerald-500 mt-0.5 flex items-center gap-1 hover:text-emerald-700 transition-colors"
                title="Open attached document"
              >
                <Paperclip size={11} />
                Attached
                <ExternalLink size={10} className="ml-0.5" />
              </button>
            </div>
          )}
        </div>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all">
          <ChevronRight size={17} />
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
