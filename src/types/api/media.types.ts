import { IGeneric } from "./auth.types";
import { ICast } from "./category.types";

export interface IMediaResponse extends IGeneric {
    data: IMediaData[]
}

interface ICategory {
    _id: string;
    name: string;
    position: number
}


export interface IMediaData {
    _id: string;
    admin_id: string;
    title: string;
    artistName?: string;
    sub_title: string;
    description: string;
    viewsCount: number;
    vidClass: string;
    amount?: number | string;
    currency?: string;
    pg: string;
    primaryColor: string;
    genre: ICategory[];
    category: ICategory[];
    cast: ICast[];
    releaseDate: string;
    expiryDate: string;
    likes: [];
    runtime: string;
    defaultRating: number;
    averageRating: number;
    featured: boolean;
    featuredSource?: "manual" | "automatic";
    active: boolean;
    showViews: boolean;
    upcoming: boolean;
    upcomingSubscribers: string[]
    landscapePhoto: string;
    portraitPhoto: string;
    video: string;
    trailer: string;
    is_series: boolean;
    episodes?: IEpisodes[]
    seasons: [];
    createdAt: string
    videoUploadId?: string;
    trailerUploadId?: string;
    videoStatus?: ProcessingItemStatus;
    trailerStatus?: ProcessingItemStatus;
    videoError?: string | null;
    trailerError?: string | null;
    processing?: IContentProcessingStatus;
}

export type ProcessingItemStatus = "pending" | "processing" | "ready" | "failed" | "missing";

export interface IProcessingItem {
    id: string | null;
    kind: "main" | "trailer";
    label: string;
    status: ProcessingItemStatus;
    progress: number | null;
    providerStatus?: string | null;
    error?: string | null;
    updatedAt?: string;
}

export interface IContentProcessingStatus {
    contentId: string;
    title: string;
    type: string;
    state: "processing" | "failed" | "ready" | "draft";
    mediaReady: boolean;
    published: boolean;
    publicationReason: string;
    items: IProcessingItem[];
}

export interface IRemiders {
    userId: string
}


export interface IMediaSeriesResponse extends IGeneric {
    data: IMediaSeriesData[]
}


export interface IMediaSeriesData extends IMediaData {
    episodes: IEpisodes[]
}

export interface IEpisodes {
    season: number;
    episode_number: number;
    episode_title: string;
    episode_description: string;
    bucket: string;
    key: string;
    _id: string;
}
