/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HistoryRecord } from "../types";
import { History, Trash2, Calendar, Sparkles, X } from "lucide-react";

interface HistorySidebarProps {
  history: HistoryRecord[];
  onSelect: (record: HistoryRecord) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function HistorySidebar({
  history,
  onSelect,
  onDelete,
  onClearAll,
  isOpen,
  onClose,
}: HistorySidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-sm border-l border-slate-100 bg-white shadow-2xl flex flex-col no-print">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50">
        <div className="flex items-center gap-2 text-slate-800">
          <History className="h-5 w-5 text-indigo-600" />
          <h3 className="font-display font-semibold">Riwayat Analisis</h3>
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600 font-mono">
            {history.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* List content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400 p-4">
            <History className="h-10 w-10 text-slate-200 mb-2" />
            <p className="text-sm font-display font-medium">Belum Ada Riwayat</p>
            <p className="text-xs max-w-[200px] mt-1">
              Hasil analisis psikologi dan peruntungan Anda akan tersimpan secara lokal di sini.
            </p>
          </div>
        ) : (
          history.map((item) => {
            const auraColor = item.result.visualAnalysis.auraColor;
            
            // Map aura color to simple theme colors
            let auraDotColor = "bg-indigo-500";
            if (auraColor.includes("Biru")) auraDotColor = "bg-blue-500";
            else if (auraColor.includes("Hijau")) auraDotColor = "bg-emerald-500";
            else if (auraColor.includes("Kuning")) auraDotColor = "bg-amber-500";
            else if (auraColor.includes("Oranye")) auraDotColor = "bg-orange-500";
            else if (auraColor.includes("Merah")) auraDotColor = "bg-rose-500";
            else if (auraColor.includes("Violet") || auraColor.includes("Ungu")) auraDotColor = "bg-purple-500";

            return (
              <div
                key={item.id}
                className="group relative rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all cursor-pointer"
                onClick={() => onSelect(item)}
              >
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Hapus riwayat untuk ${item.name}?`)) {
                      onDelete(item.id);
                    }
                  }}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                  title="Hapus analisis"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Information */}
                <div className="flex items-start gap-3 pr-6">
                  {item.photoUrl ? (
                    <img
                      src={item.photoUrl}
                      alt={item.name}
                      className="h-12 w-12 rounded-lg object-cover ring-2 ring-slate-100"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-display font-bold">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-1">
                    <h4 className="font-display font-semibold text-sm text-slate-800 line-clamp-1">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      <span>{item.result.birthAnalysis.birthDateFormatted}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Sparkles className="h-3 w-3" />
                      <span>Ramalan: {item.selectedMonth}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-3 pt-3 border-t border-slate-100/60 flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-white border border-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    <span className={`h-1.5 w-1.5 rounded-full ${auraDotColor}`} />
                    {auraColor}
                  </span>
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                    {item.result.birthAnalysis.zodiac}
                  </span>
                  <span className="text-[9px] text-slate-400 ml-auto">
                    {new Date(item.dateAnalyzed).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer / Wiping */}
      {history.length > 0 && (
        <div className="border-t border-slate-100 p-4 bg-slate-50">
          <button
            onClick={() => {
              if (confirm("Apakah Anda yakin ingin menghapus seluruh riwayat analisis?")) {
                onClearAll();
              }
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" /> Hapus Semua Riwayat
          </button>
        </div>
      )}
    </div>
  );
}
