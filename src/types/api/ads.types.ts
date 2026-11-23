import { IGeneric } from "./auth.types";

export interface IAdsResponse extends IGeneric {
    data: IAdsData[]
}


export interface IAdsData {
    _id: string;
    title: string;
    type: "general" | "web" | "mobile" | "home_ad" | "movie_ad";
    brand: string;
    link: string;
    cta: string;
    duration?: number;
    start: string;
    expiry: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    photoUrl: string;
    videoUrl?: string;
    hasVideo?: boolean;
    advertiserEmails: string[];
    reportDelivery: "none" | "live_link" | "csv";
    reportFrequency: "daily" | "weekly" | "monthly";
    reportTimezone: string;
    reportLink?: string;
    nextReportAt?: string;
    lastReportAt?: string;
    archivedAt?: string;
}

export interface ICampaignAnalytics {
  campaign: { id: string; title: string; brand: string; start: string; expiry: string; active: boolean; archivedAt?: string };
  period: { from: string; to: string };
  summary: {
    impressions: number;
    uniqueViewers: number;
    clicks: number;
    ctr: number;
    videoStarts: number;
    video25: number;
    video50: number;
    video75: number;
    videoCompletions: number;
    completionRate: number;
  };
  placements: Array<{ placement: string; impressions: number; clicks: number; ctr: number; starts: number; completions: number }>;
  platforms: Array<{ platform: string; impressions: number; clicks: number }>;
  trend: Array<{ day: string; impressions: number; clicks: number; completions: number }>;
}

export interface ICampaignAnalyticsResponse extends IGeneric { data: ICampaignAnalytics }
export interface ICampaignDeliveriesResponse extends IGeneric {
  data: Array<{ _id: string; recipient: string; delivery: "live_link" | "csv"; frequency: string; status: "pending" | "sent" | "failed"; sentAt?: string; error?: string; createdAt: string }>;
}
