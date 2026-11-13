"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  bulkDeleteRecords,
  BulkDeleteResource,
} from "@/api/bulkDelete.api";

const selectionEvent = "reeplay:bulk-selection";

function items(group: string) {
  return Array.from(document.querySelectorAll<HTMLInputElement>(`input[data-bulk-group="${group}"][data-bulk-row]`));
}

function resourceForGroup(group: string): BulkDeleteResource | null {
  if (group === "ads") return "ads";
  if (group === "users") return "users";
  if (group === "featured") return "featured";
  if (group === "upcoming") return "upcoming";
  if (group.startsWith("uploads-")) return "uploads";
  if (group.startsWith("live-")) return "lives";
  if (group.startsWith("giftcards-")) return "giftcards";
  if (group === "clients-clients") return "clients";
  if (group === "plans-plans") return "plans";
  if (group === "categories-category") return "categories";
  if (group === "categories-genre") return "genres";
  if (group === "categories-cast") return "casts";
  return null;
}

export function SelectAllCheckbox({ group, label = "Select all rows" }: { group: string; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const resource = resourceForGroup(group);

  useEffect(() => {
    function sync() {
      const rows = items(group);
      const selected = rows.filter((row) => row.checked).length;
      setSelectedCount(selected);
      setChecked(rows.length > 0 && selected === rows.length);
      if (ref.current) ref.current.indeterminate = selected > 0 && selected < rows.length;
    }
    window.addEventListener(selectionEvent, sync);
    sync();
    return () => window.removeEventListener(selectionEvent, sync);
  }, [group]);

  async function handleBulkDelete() {
    if (!resource || selectedCount === 0 || isDeleting) return;
    const selectedIds = items(group)
      .filter((row) => row.checked)
      .map((row) => row.value);

    if (!window.confirm(`Delete ${selectedIds.length} selected record(s)? This cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await bulkDeleteRecords(resource, selectedIds);
      const result = response.data?.data;
      if (!response.ok || !result) {
        toast(response.data?.message || "Bulk delete failed", { type: "error" });
        return;
      }

      if (result.failed.length > 0) {
        toast(`${result.deleted} deleted; ${result.failed.length} failed`, {
          type: "warning",
        });
      } else {
        toast(`${result.deleted} record(s) deleted`, { type: "success" });
      }
      window.setTimeout(() => window.location.reload(), 350);
    } catch {
      toast("Bulk delete failed", { type: "error" });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        aria-label={label}
        onChange={(event) => {
          items(group).forEach((row) => { row.checked = event.target.checked; });
          setChecked(event.target.checked);
          window.dispatchEvent(new Event(selectionEvent));
        }}
      />
      {resource && selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-5 rounded-xl border border-white/10 bg-[#181818] px-5 py-3 shadow-2xl">
          <span className="whitespace-nowrap text-sm font-medium text-white">
            {selectedCount} selected
          </span>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleBulkDelete}
            className="rounded-lg bg-red_500 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting…" : "Delete selected"}
          </button>
        </div>
      )}
    </>
  );
}

export function RowCheckbox({ group, value, label = "Select row" }: { group: string; value: string; label?: string }) {
  return <input type="checkbox" data-bulk-group={group} data-bulk-row value={value} aria-label={label} onChange={() => window.dispatchEvent(new Event(selectionEvent))} />;
}
