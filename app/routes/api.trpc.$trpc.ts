import { appRouter } from "~/server/trpc/router";
import { remixHTTPRequestHandler } from "~/server/trpc/remix/adapter";
import { createContext } from "~/server/trpc";

export const { loader, action } = remixHTTPRequestHandler({
  createContext,
  router: appRouter,
});
