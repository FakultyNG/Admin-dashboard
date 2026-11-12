"use client";

import { useAppSelector } from "@/hooks/reduxHook";
import { selectUserProfile } from "@/store/slices/usersSlice";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { destroyCookie } from "nookies";
import { useEffect, useRef, useState } from "react";
import ModalNotificationBox from "./ModalNotification";

const routeLabels: Record<string, string> = { ad: "Ad manager", cta: "Call to action", giftcards: "Gift cards", report: "Reports", uploads: "Content library" };

function HeaderIcon({ children, label, onClick }: { children: React.ReactNode; label: string; onClick?: () => void }) {
  return <button type="button" className="header-icon-button" aria-label={label} onClick={onClick}>{children}</button>;
}

export default function Header() {
  const user = useAppSelector(selectUserProfile);
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const segment = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  const title = routeLabels[segment] ?? segment.replaceAll("-", " ");
  const isChannel = user?.profile.role === "channel";

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  if (pathname === "/") return null;

  function logout() {
    const tokenKey = user?.profile.role === "superadmin" ? "superadmin_token" : "auth_token";
    localStorage.removeItem(tokenKey);
    destroyCookie(null, tokenKey, { path: "/" });
    router.push("/");
  }

  return (
    <>
      <header className="app-header">
        <div className="min-w-0 pl-12 lg:pl-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Reeplay admin</p>
          <h1 className="truncate text-lg font-semibold capitalize tracking-tight text-white sm:text-xl">{title}</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {!isChannel ? <HeaderIcon label="Create broadcast" onClick={() => setBroadcastOpen(true)}><Image src="/broadcast.svg" alt="" width={19} height={19} /></HeaderIcon> : null}
          <HeaderIcon label="Notifications"><span className="relative"><Image src="/notification.svg" alt="" width={20} height={20} /><span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-[#10131a]" /></span></HeaderIcon>

          <div className="relative ml-1" ref={menuRef}>
            <button type="button" className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70" onClick={() => setMenuOpen((value) => !value)} aria-label="Open account menu" aria-expanded={menuOpen}>
              <Image src={user?.photo_url?.startsWith("https") ? user.photo_url : "/user.png"} alt="" width={34} height={34} className="h-[34px] w-[34px] rounded-xl object-cover ring-1 ring-white/10" />
              <div className="hidden text-left sm:block"><p className="max-w-28 truncate text-sm font-medium text-slate-100">{user?.profile.first_name || "Account"}</p><p className="text-[11px] capitalize text-slate-500">{user?.profile.role}</p></div>
              <svg className={`hidden h-4 w-4 text-slate-500 transition sm:block ${menuOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
            </button>
            {menuOpen ? <div className="account-menu"><button onClick={() => router.push("/account")}>Account settings</button><button onClick={() => router.push("/report")}>Reports</button><div className="my-1 h-px bg-white/[0.07]" /><button className="text-red-400 hover:!bg-red-500/10" onClick={logout}>Log out</button></div> : null}
          </div>
        </div>
      </header>
      {broadcastOpen ? <ModalNotificationBox onBack={() => setBroadcastOpen(false)} /> : null}
    </>
  );
}
