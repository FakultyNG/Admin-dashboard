import { IGeneric } from "./auth.types";

export interface IEventResponse extends IGeneric {
    data: IEventData[]
}


export interface IEventData {
    _id: string;
    title: string;
    location: string;
    description: string;
    active: boolean;
    expired: boolean;
    type: string;
    start: string;
    sponsored: boolean;
    popular: boolean;
    featured: boolean;
    featuredSource?: "manual" | "automatic";
    coverPhoto: string;
    createdAt: string;
    updatedAt: string;
    upcoming: boolean;
    upcomingSubscribers: string[];
    channelLogo: string | null;
    viewsCount: number;
    streamKey: string;
    vidClass: string
    clientDetails: {
        _id: string;
        fullName: string
    }
    previewVideo: string;
    pg: string;
    expiry: string;
    voteInfo: {
        _id: string
        price: string
        status: boolean
        createdAt: string
        updatedAt: string
    } | null
    hasPaid:boolean
}

export interface ICreateLiveData {
    clientId: string;
    title: string;
    pg: string;
    start: string;
    expiry: string;
    description: string;
    vidClass: string;
    type: string;
    location: string;
    subTitle: string;
    upcoming?: boolean;
    currency?: string;
    amount?: number;
    category:string[]
}

export interface ICreateLiveContentResponse extends IGeneric{
    data:{
        liveId:string
    }
}
