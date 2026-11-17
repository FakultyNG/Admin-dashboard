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
}

export interface IHomeAdData {
    _id: string;
    title: string;
    type: "home_ad";
    link: string;
    active: boolean;
    photoUrl: string;
    createdAt: string;
    updatedAt: string;
}

export interface IHomeAdsResponse extends IGeneric {
    data: IHomeAdData[];
}
