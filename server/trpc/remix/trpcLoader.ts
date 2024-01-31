import type { LoaderFunctionArgs } from "@remix-run/node";
import { createContext, t } from "~/server/trpc";
import type { AppRouter } from "~/server/trpc/router";

const createTRPCLoader =
  (router: AppRouter) => async (args: LoaderFunctionArgs) => {
    const factory = t.createCallerFactory(router);
    const ctx = await createContext(args.request.headers);
    return factory(ctx);
  };

export { createTRPCLoader };
