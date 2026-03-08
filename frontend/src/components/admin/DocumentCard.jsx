import React from "react";
import {
  FileText,
  Sparkles,
  ChevronRight,
  Paperclip,
  ExternalLink,
  PowerOff,
  Power,
  Trash2,
} from "lucide-react";

const ICONS = [FileText, Sparkles, FileText, Sparkles];

const DocumentCard = ({
  doc,
  idx,
  onEdit,
  onOpenFile,
  onDisable,
  onDelete,
}) => {
  const Icon = ICONS[idx % ICONS.length];
  const isActive = !!doc.in_use;
  const reqCount = doc.requirements?.length ?? 0;
  const fieldCount = doc.form_fields?.length ?? 0;
  const hasFile = !!doc.template_path;

  const handlerLabel =
    doc.handler_role_id === 3 || doc.handler_role_id === "3"
      ? "Clerk"
      : doc.handler_role_id === 4 || doc.handler_role_id === "4"
        ? "Zone Leader"
        : "Unassigned";

  return (
    <div
      onClick={() => onEdit(doc)}
      className="group bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 cursor-pointer
                 hover:border-emerald-200 hover:shadow-sm transition-all duration-200 flex flex-col"
    >
      {/* ── Top: icon + status pill ── */}
      <div className="flex items-start justify-between mb-5">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
            ${
              isActive
                ? "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white"
                : "bg-slate-100 text-slate-400"
            }`}
        >
          <Icon size={18} />
        </div>

        {/* Clicking the pill also opens the disable modal */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDisable(doc);
          }}
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full
                      transition-all hover:opacity-80 active:scale-95
                      ${
                        isActive
                          ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
                          : "text-slate-500 bg-slate-100 border border-slate-200"
                      }`}
        >
          {isActive ? "Active" : "Disabled"}
        </button>
      </div>

      {/* ── Name + fee ── */}
      <h3 className="text-sm font-bold text-slate-800 leading-snug mb-0.5">
        {doc.document_name}
      </h3>
      <p className="text-sm text-slate-400">
        Fee: ₱{parseFloat(doc.fee || 0).toFixed(2)}
      </p>

      {/* ── Footer ── */}
      <div className="mt-auto pt-4 border-t border-slate-50 flex items-end justify-between gap-2 mt-5">
        {/* Meta */}
        <div className="flex gap-4 flex-wrap">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Reqs
            </p>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">
              {reqCount}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Fields
            </p>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">
              {fieldCount}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Handler
            </p>
            <p
              className={`text-xs font-semibold mt-0.5
              ${handlerLabel === "Unassigned" ? "text-slate-400 italic" : "text-emerald-600"}`}
            >
              {handlerLabel}
            </p>
          </div>
          {hasFile && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Template
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenFile(doc);
                }}
                className="text-xs font-semibold text-emerald-500 mt-0.5 flex items-center gap-1 hover:text-emerald-700 transition-colors"
              >
                <Paperclip size={10} /> Attached <ExternalLink size={9} />
              </button>
            </div>
          )}
        </div>

        {/* Action buttons — stop propagation so they don't open edit */}
        <div
          className="flex items-center gap-0.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Disable / Enable */}
          <button
            onClick={() => onDisable(doc)}
            title={isActive ? "Disable" : "Enable"}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors
              ${
                isActive
                  ? "text-slate-300 hover:bg-amber-50 hover:text-amber-500"
                  : "text-slate-300 hover:bg-emerald-50 hover:text-emerald-600"
              }`}
          >
            {isActive ? <PowerOff size={13} /> : <Power size={13} />}
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(doc)}
            title="Delete"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300
                       hover:bg-rose-50 hover:text-rose-500 transition-colors"
          >
            <Trash2 size={13} />
          </button>

          {/* Edit chevron */}
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300
                          group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all"
          >
            <ChevronRight size={15} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
