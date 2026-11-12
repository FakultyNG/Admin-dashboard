"use client";

import { useEffect, useRef, useState } from "react";

const selectionEvent = "reeplay:bulk-selection";

function items(group: string) {
  return Array.from(document.querySelectorAll<HTMLInputElement>(`input[data-bulk-group="${group}"][data-bulk-row]`));
}

export function SelectAllCheckbox({ group, label = "Select all rows" }: { group: string; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    function sync() {
      const rows = items(group);
      const selected = rows.filter((row) => row.checked).length;
      setChecked(rows.length > 0 && selected === rows.length);
      if (ref.current) ref.current.indeterminate = selected > 0 && selected < rows.length;
    }
    window.addEventListener(selectionEvent, sync);
    sync();
    return () => window.removeEventListener(selectionEvent, sync);
  }, [group]);

  return (
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
  );
}

export function RowCheckbox({ group, value, label = "Select row" }: { group: string; value: string; label?: string }) {
  return <input type="checkbox" data-bulk-group={group} data-bulk-row value={value} aria-label={label} onChange={() => window.dispatchEvent(new Event(selectionEvent))} />;
}
