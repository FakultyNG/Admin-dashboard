"use client";

import { useGetLivestreamDetailsQuery } from "@/api/dashboard";
import { useAppSelector } from "@/hooks/reduxHook";
import { selectUserProfile } from "@/store/slices/usersSlice";
import Image from "next/image";
import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const adminPrimary = ["dashboard", "featured", "users", "uploads", "live", "upcoming", "categories"];
const adminManage = ["ad", "plans", "giftcards", "clients", "suggestions", "settings"];
const clientLinks = ["dashboard", "live", "plans", "withdrawal", "currency", "support"];
const uploadLinks = ["movies", "series", "skits", "music videos"];

const labels: Record<string, string> = {
  ad: "Ad manager",
  giftcards: "Gift cards",
  support: "Support tickets",
};

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-5 w-5" aria-hidden="true">
      <span className={`absolute left-0 top-1 h-0.5 w-5 rounded bg-current transition ${open ? "translate-y-1.5 rotate-45" : ""}`} />
      <span className={`absolute left-0 top-2.5 h-0.5 w-5 rounded bg-current transition ${open ? "opacity-0" : ""}`} />
      <span className={`absolute left-0 top-4 h-0.5 w-5 rounded bg-current transition ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
    </span>
  );
}

interface NavItemProps {
  name: string;
  hasLive?: boolean;
  onNavigate: () => void;
}

function NavItem({ name, hasLive, onNavigate }: NavItemProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(pathname.startsWith("/uploads"));
  const isActive = pathname.split("/")[1] === name;
  const isUploads = name === "uploads";
  const displayName = name === "plans" && hasLive ? "Edit live" : labels[name] ?? name;
  const iconSource = isActive
    ? name === "upcoming"
      ? "/upcoming-active.svg"
      : `/${name}WH.svg`
    : `/${name}.svg`;

  useEffect(() => {
    if (!pathname.startsWith("/uploads")) setExpanded(false);
  }, [pathname]);

  const content = (
    <>
      <span className="sidebar-icon">
        <Image src={iconSource} width={20} height={20} alt="" />
      </span>
      <span className="flex-1 truncate capitalize">{displayName}</span>
      {isUploads ? (
        <svg className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </>
  );

  return (
    <li>
      {isUploads ? (
        <button type="button" className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`} onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
          {content}
        </button>
      ) : (
        <Link href={`/${name}`} className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`} onClick={onNavigate}>
          {content}
        </Link>
      )}

      {isUploads && expanded ? (
        <ul className="ml-11 mt-1 space-y-1 border-l border-white/10 pl-3">
          {uploadLinks.map((item) => {
            const href = `/uploads/${item}`;
            const selected = decodeURI(pathname) === href;
            return (
              <li key={item}>
                <Link href={href} onClick={onNavigate} className={`block rounded-lg px-3 py-2 text-sm capitalize transition ${selected ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-200"}`}>
                  {item}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </li>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector(selectUserProfile);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasLive, setHasLive] = useState(false);
  const role = user?.profile?.role?.toLowerCase() ?? "";
  const isSuperadmin = role === "superadmin";
  const supportsCta = ["event", "podcast", "tvshow"].includes(role) || role.includes("channel");
  const { data: liveDetails, isSuccess } = useGetLivestreamDetailsQuery(undefined, { skip: isSuperadmin || !user });

  const groups = useMemo(
    () => isSuperadmin
      ? [{ label: "Workspace", links: adminPrimary }, { label: "Management", links: adminManage }]
      : [{ label: "Workspace", links: clientLinks }],
    [isSuperadmin],
  );

  useEffect(() => {
    if (!hasLive && !isSuperadmin && isSuccess) setHasLive((liveDetails?.data?.length ?? 0) > 0);
  }, [hasLive, isSuccess, isSuperadmin, liveDetails]);

  useEffect(() => setMobileOpen(false), [pathname]);

  if (pathname === "/" || !user?.profile) return null;

  return (
    <>
      <button type="button" className="sidebar-mobile-trigger" onClick={() => setMobileOpen((value) => !value)} aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen}>
        <MenuIcon open={mobileOpen} />
      </button>
      {mobileOpen ? <button className="sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close navigation" /> : null}

      <aside className={`app-sidebar ${mobileOpen ? "app-sidebar-open" : ""}`}>
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center border-b border-white/[0.07] px-6">
            <Image src="/Logo.png" width={132} height={44} alt="Reeplay" className="h-auto w-[132px] object-contain" priority />
          </div>

          <nav className="custom-scrollbar flex-1 overflow-y-auto px-3 py-5" aria-label="Main navigation">
            {groups.map((group) => (
              <div key={group.label} className="mb-7">
                <p className="sidebar-label">{group.label}</p>
                <ul className="space-y-1">
                  {group.links.map((link) => <NavItem key={link} name={link} hasLive={!isSuperadmin && hasLive} onNavigate={() => setMobileOpen(false)} />)}
                </ul>
              </div>
            ))}

            {supportsCta ? (
              <button type="button" onClick={() => router.push("/cta")} className={`sidebar-link w-full ${pathname === "/cta" ? "sidebar-link-active" : ""}`}>
                <span className="sidebar-icon text-lg">＋</span><span>Call to action</span>
              </button>
            ) : null}
          </nav>

          <div className="m-3 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3">
            <SafeImage src={user.photo_url} width={40} height={40} alt="" className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/10" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user.profile.first_name} {user.profile.last_name}</p>
              <p className="truncate text-xs capitalize text-slate-500">{role} panel</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
