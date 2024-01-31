import { TRPCError, initTRPC } from "@trpc/server";
import cookieParser from "cookie";
import { RemixCreateContextFn } from "~/server/trpc/remix/adapter";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_CONFIG } from "~/server/serverConfig";

export interface TRPCUserContext {
  type: "user";
  user: { id: string; email: string };
}

export interface TRPCAnonContext {
  type: "anon";
}

export interface TRPCServerContext {
  type: "server";
}

export type TRPCContext = TRPCUserContext | TRPCAnonContext | TRPCServerContext;

export const t = initTRPC.context<TRPCContext>().create();

const isAuthedUser = t.middleware(({ next, ctx }) => {
  if (!ctx?.type || ctx.type === "anon" || ctx.type === "server") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  return next({
    ctx,
  });
});

export const createContext: RemixCreateContextFn = async (
  headers,
): Promise<TRPCContext> => {
  const cookies = cookieParser.parse(headers.get("cookie") ?? "");
  const jwt =
    cookies[SUPABASE_CONFIG.APP_ACCESS_TOKEN_COOKIE_NAME] ??
    headers.get("authorization")?.replace("Bearer ", "");

  if (!jwt) {
    return {
      type: "anon",
    };
  }

  const supabaseClient = createClient(
    SUPABASE_CONFIG.PROJECT_URL,
    SUPABASE_CONFIG.PUBLIC_ANON_KEY,
  );
  const response = await supabaseClient.auth.getUser(jwt);

  if (!response.data.user) {
    return {
      type: "anon",
    };
  }

  const user = response.data.user;

  return {
    type: "user",
    user: {
      id: user.id,
      email: user.email ?? "",
    },
  };
};

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;
export const protectedUserOnlyProcedure = t.procedure.use(isAuthedUser);
