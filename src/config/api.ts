const PRODUCTION_MAIN_API = "https://reeplay-api-ts-production.up.railway.app/api/v1";

export const MAIN_API_BASE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || PRODUCTION_MAIN_API
).replace(/\/+$/, "");
