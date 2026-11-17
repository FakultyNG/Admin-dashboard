"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  AdminNotificationItem,
  getAdminNotificationInbox,
  getAdminNotificationSettings,
  getAdminNotificationUnreadCount,
  markAllAdminNotificationsRead,
  updateAdminNotificationSound,
} from "@/api/adminNotifications.api";

const labels: Record<AdminNotificationItem["category"], string> = {
  suggestions: "Suggestion",
  new_services: "New service",
  upcoming_events: "Upcoming",
  new_arrivals: "New arrival",
  live_channels: "Live",
  system: "System",
};

function playDefaultChime() {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const gain = context.createGain();
  const oscillator = context.createOscillator();
  oscillator.frequency.setValueAtTime(740, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(1040, context.currentTime + 0.16);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.28);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.3);
}

export default function AdminNotificationMenu() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const previousCount = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<AdminNotificationItem[]>([]);
  const [soundUrl, setSoundUrl] = useState<string | null>(null);
  const [soundName, setSoundName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const playSound = useCallback(() => {
    if (soundUrl) {
      void new Audio(soundUrl).play().catch(playDefaultChime);
    } else {
      playDefaultChime();
    }
  }, [soundUrl]);

  const refresh = useCallback(async (playOnIncrease = true) => {
    const response = await getAdminNotificationUnreadCount();
    if (!response.ok || !response.data) return;
    const next = response.data.data.count;
    if (playOnIncrease && previousCount.current !== null && next > previousCount.current) playSound();
    previousCount.current = next;
    setCount(next);
  }, [playSound]);

  useEffect(() => {
    void refresh(false);
    void getAdminNotificationSettings().then(response => {
      if (response.ok && response.data) {
        setSoundUrl(response.data.data.soundUrl);
        setSoundName(response.data.data.soundName);
      }
    });
    const timer = window.setInterval(() => void refresh(true), 30000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  async function toggleMenu() {
    const next = !open;
    setOpen(next);
    if (!next) return;
    const response = await getAdminNotificationInbox();
    if (response.ok && response.data) setItems(response.data.data);
    if (count > 0) {
      await markAllAdminNotificationsRead();
      previousCount.current = 0;
      setCount(0);
    }
  }

  async function uploadSound(file?: File) {
    if (!file) return;
    setUploading(true);
    const response = await updateAdminNotificationSound(file);
    setUploading(false);
    if (!response.ok || !response.data) {
      toast(response.data?.message || "Could not update notification sound", { type: "error" });
      return;
    }
    setSoundUrl(response.data.data.soundUrl);
    setSoundName(response.data.data.soundName);
    toast("Notification sound updated", { type: "success" });
  }

  return (
    <div className="relative" ref={rootRef}>
      <button type="button" className={`header-icon-button ${count > 0 ? "text-red-500" : "text-white"}`} aria-label={count ? `${count} unread notifications` : "No unread notifications"} onClick={toggleMenu}>
        <span className="relative block">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 23a2 2 0 0 0 1.74-1.03c.27-.48-.2-.96-.75-.96h-1.98c-.55 0-1.02.48-.75.96A2 2 0 0 0 12 23Zm7.29-5.71A1 1 0 0 1 19 16.59V11a7 7 0 0 0-4.72-6.61A1.08 1.08 0 0 1 13.5 3.36V2.5a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v.86c0 .47-.33.87-.78 1.03A7 7 0 0 0 5 11v5.59a1 1 0 0 1-.29.7l-1.5 1.5A.7.7 0 0 0 3.71 20h16.58a.7.7 0 0 0 .5-1.21l-1.5-1.5Z" /></svg>
          {count > 0 && <span className="absolute -right-2.5 -top-2.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-4 text-white ring-2 ring-[#10131a]">{count > 99 ? "99+" : count}</span>}
        </span>
      </button>

      {open && <div className="absolute right-0 top-12 z-[120] w-[min(92vw,390px)] overflow-hidden rounded-2xl border border-white/10 bg-[#11141b] shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div><p className="text-sm font-semibold text-white">Notifications</p><p className="text-[11px] text-slate-500">Recent admin activity</p></div>
          <label className="cursor-pointer rounded-lg border border-white/10 px-3 py-2 text-[11px] font-medium text-slate-300 transition hover:border-red-500/40 hover:text-white">
            {uploading ? "Uploading…" : "Change sound"}
            <input className="hidden" type="file" accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4" disabled={uploading} onChange={event => void uploadSound(event.target.files?.[0])} />
          </label>
        </div>
        {soundName && <p className="truncate border-b border-white/[0.06] px-4 py-2 text-[10px] text-slate-600">Sound: {soundName}</p>}
        <div className="max-h-[420px] overflow-y-auto p-2">
          {items.length === 0 ? <p className="px-4 py-10 text-center text-sm text-slate-500">No notifications yet</p> : items.map(item => <button key={item._id} type="button" className="block w-full rounded-xl px-3 py-3 text-left transition hover:bg-white/[0.05]" onClick={() => { setOpen(false); if (item.route) router.push(item.route); }}>
            <div className="mb-1 flex items-center justify-between gap-3"><span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-300">{labels[item.category]}</span><time className="text-[10px] text-slate-600">{new Date(item.createdAt).toLocaleDateString()}</time></div>
            <p className="text-sm font-medium text-slate-100">{item.title}</p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.description}</p>
          </button>)}
        </div>
      </div>}
    </div>
  );
}
