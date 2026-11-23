import { IGeneric } from "./auth.types";
import { IEventData } from "./live.types";

export interface IDashboardTOTAL_Contents extends IGeneric {
  data: IDashboardTOTAL;
}

export interface IDashboardTOTAL_Users extends IGeneric {
  data: IDashboardUsers;
}

export interface IAnalyticsOverviewResponse extends IGeneric {
  data: {
    days: number;
    summary: {
      uniqueViewers: number;
      watchHours: number;
      completions: number;
      shares: number;
      completionRate: number;
    };
    trend: Array<{
      day: string;
      uniqueViewers: number;
      watchHours: number;
      completions: number;
      shares: number;
    }>;
    topContent: Array<{
      id: string;
      type: "vod" | "live";
      title: string;
      uniqueViewers: number;
      watchHours: number;
      completions: number;
      shares: number;
      completionRate: number;
    }>;
  };
}

export type AnalyticsReportFilters = {
  days: number;
  platform: "all" | "android" | "ios" | "web" | "unknown";
  contentType: "all" | "vod" | "episode" | "live";
};

export interface IAnalyticsReportResponse extends IGeneric {
  data: {
    filters: AnalyticsReportFilters;
    audience: {
      activeUsers: number;
      returningUsers: number;
      registrations: number;
      registrationsByGender: Array<{ gender: string; count: number }>;
      retention: Array<{ days: number; eligible: number; returned: number; rate: number }>;
    };
    engagement: {
      playStarts: number;
      completions: number;
      completionRate: number;
      watchHours: number;
      shares: number;
      searches: number;
      downloads: number;
      casts: number;
      notificationOpens: number;
    };
    playback: {
      errors: number;
      errorRate: number;
      bufferEvents: number;
      bufferingMinutes: number;
      averageStartupMs: number;
    };
    funnel: Array<{ eventType: string; users: number; events: number }>;
    trend: Array<{ day: string; activeUsers: number }>;
    topContent: Array<{
      id: string;
      type: "vod" | "episode" | "live";
      title: string;
      uniqueViewers: number;
      playStarts: number;
      watchHours: number;
      completions: number;
      completionRate: number;
      shares: number;
      playbackErrors: number;
      bufferingMinutes: number;
    }>;
    revenue: {
      attempts: number;
      successes: number;
      failures: number;
      byStatusAndUseCase: Array<{
        status: string;
        useCase: string;
        currency: string;
        count: number;
        amount: number;
        uniquePayers: number;
      }>;
      revenueByCurrency: Array<{ currency: string; amount: number }>;
    };
    houseAds: Array<{
      id: string;
      title: string;
      impressions: number;
      clicks: number;
      ctr: number;
    }>;
    topSearches: Array<{ term: string; searches: number; uniqueViewers: number }>;
    releases: Array<{
      platform: string;
      appVersion: string;
      users: number;
      sessions: number;
      playStarts: number;
      playbackErrors: number;
      errorRate: number;
      bufferEvents: number;
      averageStartupMs: number;
    }>;
  };
}

export interface IDashboardTOTAL {
  totalContents: number;
  totalMovieSeries: number;
  totalMusicVideos: number;
  totalSkits: number;
  totalActiveEvents: number;
}

export interface IDashboardUsers {
  totalBalance: {
    total_balance: number;
  };
  totUsers: number;
  freeUsers: number;
  activeSubscriptions: number;
}

export interface ILivestreamDetailsResponse extends IGeneric {
  data: ILivestreamDetails[]
}

export interface ILivestreamDetails extends IEventData {
  stream_server: string;
  stream_url: string;
  stream_key: string;
}
