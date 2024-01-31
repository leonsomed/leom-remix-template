export const TRPC_CONFIG = {
  API_PORT: parseInt(process.env.API_PORT as string, 10),
  SERVER_URL: process.env.TRPC_SERVER_URL as string,
};
export const WS_CONFIG = {
  SERVER_URL: process.env.WS_SERVER_URL as string,
};
export const SUPABASE_CONFIG = {
  PUBLIC_ANON_KEY: process.env.SUPABASE_PUBLIC_ANON_KEY as string,
  PROJECT_URL: process.env.SUPABASE_PROJECT_URL as string,
  APP_ACCESS_TOKEN_COOKIE_NAME: "x-access-token",
  APP_REFRESH_TOKEN_COOKIE_NAME: "x-refresh-token",
};
export const REDIS_CONFIG = {
  CONNECTION_STRING: process.env.REDIS_URL as string,
};
