import { REDIS_CONFIG } from "~/server/serverConfig";
import IORedis from "ioredis";

export const connection = new IORedis(REDIS_CONFIG.CONNECTION_STRING, {
  maxRetriesPerRequest: null,
});
