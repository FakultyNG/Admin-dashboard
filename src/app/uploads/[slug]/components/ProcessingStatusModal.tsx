"use client";

import { IContentProcessingStatus } from "@/types/api/media.types";

interface Props {
  status: IContentProcessingStatus;
  refreshing: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const stateStyles = {
  ready: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  processing: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  failed: "bg-red-500/15 text-red-300 border-red-500/30",
  draft: "bg-white/10 text-gray-300 border-white/15",
};

export function ProcessingStatusModal({ status, refreshing, onClose, onRefresh }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[86vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#111214] shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Media processing</p>
            <h2 className="mt-1 text-xl font-medium text-white">{status.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-xs capitalize ${stateStyles[status.state]}`}>
                {status.state}
              </span>
              <span className={`text-xs ${status.published ? "text-emerald-300" : "text-gray-400"}`}>
                {status.publicationReason}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg px-3 py-1 text-xl text-gray-400 hover:bg-white/10 hover:text-white" aria-label="Close">×</button>
        </div>

        <div className="max-h-[58vh] space-y-3 overflow-y-auto p-5">
          {status.items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-gray-400">
              No episode media has been added yet.
            </div>
          ) : status.items.map((item, index) => {
            const progress = item.status === "ready" ? 100 : Math.max(0, Math.min(100, item.progress ?? 0));
            return (
              <div key={`${item.id ?? item.label}-${index}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="mt-0.5 text-xs capitalize text-gray-400">
                      {item.kind} · {item.providerStatus?.toLowerCase() ?? item.status}
                    </p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs capitalize ${stateStyles[item.status === "missing" ? "draft" : item.status === "pending" ? "processing" : item.status]}`}>
                    {item.status}
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full rounded-full transition-all duration-500 ${item.status === "failed" || item.status === "missing" ? "bg-red-500" : item.status === "ready" ? "bg-emerald-400" : "bg-amber-400"}`} style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>{item.error ?? (item.progress == null && item.status === "processing" ? "Provider is processing; percentage unavailable" : "")}</span>
                  <span>{item.progress == null ? "—" : `${Math.round(progress)}%`}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 px-5 py-4">
          <button onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5">Close</button>
          <button onClick={onRefresh} disabled={refreshing} className="rounded-lg bg-red_500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {refreshing ? "Checking…" : "Check now"}
          </button>
        </div>
      </div>
    </div>
  );
}
