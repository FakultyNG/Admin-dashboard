const PRODUCTION_MAIN_API = "https://api.reeplay.app/api/v1";
const PRODUCTION_TYPESCRIPT_API = "https://typescript.reeplay.app/api/v1";

export const MAIN_API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_RP_baseurl ||
  PRODUCTION_MAIN_API;

export const TYPESCRIPT_API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL_TS_PROD ||
  PRODUCTION_TYPESCRIPT_API;
