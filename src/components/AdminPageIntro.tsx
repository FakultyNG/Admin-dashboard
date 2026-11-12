"use client";

import { usePathname } from "next/navigation";

type PageMeta = {
  kicker: string;
  title: string;
  description: string;
};

const PAGE_META: Record<string, PageMeta> = {
  dashboard: { kicker: "Workspace overview", title: "Dashboard", description: "Monitor catalogue activity, audiences, and live performance from one place." },
  featured: { kicker: "Content curation", title: "Featured content", description: "Choose and order the titles that receive the most visibility across Reeplay." },
  users: { kicker: "Audience management", title: "Users", description: "Find accounts, review access, and manage customer records." },
  uploads: { kicker: "Content library", title: "Uploads", description: "Manage published video, artwork, metadata, seasons, and episodes." },
  live: { kicker: "Broadcast operations", title: "Live", description: "Schedule and manage channels, events, shows, podcasts, and sports broadcasts." },
  upcoming: { kicker: "Release planning", title: "Upcoming", description: "Curate content and live events that audiences can discover before release." },
  categories: { kicker: "Content taxonomy", title: "Organize your catalogue", description: "Manage the categories, genres, and cast information used across Reeplay." },
  ad: { kicker: "Campaign management", title: "Ad manager", description: "Create, review, and manage promotional placements across Reeplay." },
  plans: { kicker: "Revenue controls", title: "Plans", description: "Configure subscription offers and live-event access." },
  giftcards: { kicker: "Rewards and credit", title: "Gift cards", description: "Generate and track redeemable codes for customers and partners." },
  clients: { kicker: "Partner management", title: "Clients", description: "Manage creator, channel, and commercial partner accounts." },
  suggestions: { kicker: "Audience feedback", title: "Suggestions", description: "Review customer requests and turn useful feedback into action." },
  settings: { kicker: "Workspace controls", title: "Settings", description: "Configure platform preferences, content rules, and account options." },
  report: { kicker: "Business intelligence", title: "Reports", description: "Explore performance, audience, and revenue insights." },
  withdrawal: { kicker: "Finance operations", title: "Withdrawals", description: "Review and manage payout activity securely." },
  currency: { kicker: "Regional pricing", title: "Currency", description: "Manage the currencies and conversion settings used for payments." },
  cta: { kicker: "Audience engagement", title: "Call to action", description: "Create interactive prompts and voting experiences for live content." },
  account: { kicker: "Profile and security", title: "Account", description: "Manage your administrator profile and access preferences." },
};

export default function AdminPageIntro() {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean)[0];
  const meta = PAGE_META[segment];

  if (!meta) return null;

  return (
    <div className="admin-page-intro" aria-labelledby="admin-page-title">
      <p className="admin-page-kicker">{meta.kicker}</p>
      <h1 id="admin-page-title" className="admin-page-title">{meta.title}</h1>
      <p className="admin-page-description">{meta.description}</p>
    </div>
  );
}
