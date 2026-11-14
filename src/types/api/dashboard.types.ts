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
