import { IGeneric } from "./auth.types";


export interface IPagination {
    limit: number;
    page: number
}


export interface ISuggestionResponse extends IGeneric {
    data: ISuggestionData[]
}

export interface IUnreadSuggestionCountResponse extends IGeneric {
    data: { count: number }
}


export interface ISuggestionData {
    _id: string;
    user_id: string;
    message: string;
    seen: boolean;
    createdAt: string;
    updatedAt: string;
    user: IUserObject[]
}

export interface IUserObject {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    country_code: string;
    mobile: string;
    role: string;
    photo: {
        Bucket: string;
        Key: string;
        ContentType: string;
    };
}
