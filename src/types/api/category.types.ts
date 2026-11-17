import { IGeneric } from "./auth.types";


export interface ICategoryResponse extends IGeneric {
    data: ICategory[]
}

export interface ICastResponse extends IGeneric {
    data: ICast[]
}

export interface ICategory {
    _id: string;
    name: string;
    position?: string;
    location?: CategoryLocation;
    feedType?: "standard" | "personalized";
    createdAt: string;
    updatedAt: string;
}

export interface ICast extends ICategory {
    title: string;
    link:string;
    selectButtonType:string;
    description:string;
    photoUrl:string
}

export interface ICastResponse extends IGeneric {
    data: ICast[]
}


export interface IAddCategory {
    name: string;
    title?: string
    position?: number
    location?: CategoryLocation
}

export type CategoryLocation =
    | "Homepage"
    | "Live/Channels"
    | "Live/Events"
    | "Live/Tv Shows"
    | "Live/Sports"
    | "Live/Podcast";
