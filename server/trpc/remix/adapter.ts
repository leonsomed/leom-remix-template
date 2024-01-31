import type { LoaderFunctionArgs } from "@remix-run/node";
import { TRPCError } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { TRPCContext } from "~/server/trpc";
import type { AppRouter } from "~/server/trpc/router";
import { getErrorShape } from "@trpc/server/shared";

export type RemixCreateContextFn = (headers: Headers) => Promise<TRPCContext>;

interface RemixHTTPRequestHandlerParams {
  router: AppRouter;
  createContext: RemixCreateContextFn;
}

export function remixHTTPRequestHandler({
  createContext,
  ...opts
}: RemixHTTPRequestHandlerParams) {
  function handler(args: LoaderFunctionArgs) {
    const path = typeof args.params.trpc === "string" ? args.params.trpc : null;

    if (path === null) {
      const error = getErrorShape({
        config: opts.router._def._config,
        error: new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: 'Query "trpc" not found - is the file named `$trpc.ts`?',
        }),
        type: "unknown",
        ctx: undefined,
        path: undefined,
        input: undefined,
      });

      return new Response(JSON.stringify({ error }), {
        headers: { "Content-Type": "application/json" },
        status: 422,
      });
    }

    const endpoint = new URL(args.request.url).pathname.replace(path, "");

    return fetchRequestHandler({
      ...opts,
      endpoint,
      req: args.request,
      createContext: ({ req }) => createContext(req.headers),
    });
  }

  return { loader: handler, action: handler };
}
