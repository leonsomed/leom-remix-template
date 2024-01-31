import {
  CreateTRPCClientOptions,
  createTRPCReact,
  createTRPCClientProxy,
} from "@trpc/react-query";
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWSClient, httpBatchLink, splitLink, wsLink } from "@trpc/client";
import { supabaseClient } from "~/app/utils/supabase";
import type { AppRouter } from "~/server/trpc/router";
import { TRPC_CONFIG } from "~/server/serverConfig";

function createTRPCRemix(opts: WithTRPCNoSSROptions) {
  const hooks = createTRPCReact<AppRouter>();
  const proxy = createTRPCClientProxy<AppRouter>(
    hooks.createClient(opts.config({})),
  );

  return {
    hooks,
    proxy,
    withTRPC: withTRPC(opts),
  };
}

const httpLink = httpBatchLink({
  url:
    typeof window === "undefined"
      ? TRPC_CONFIG.SERVER_URL
      : window.ENV.TRPC_SERVER_URL,
  async headers() {
    const result = await supabaseClient.auth.getSession();

    return {
      ...(result.data.session && {
        authorization: result.data.session.access_token,
      }),
    };
  },
});

const webSocketLink =
  typeof window === "undefined"
    ? undefined
    : wsLink<AppRouter>({
        client: createWSClient({
          url: window.ENV.WS_SERVER_URL,
        }),
      });

const link = webSocketLink
  ? splitLink({
      condition: ({ type }) => type === "subscription",
      true: webSocketLink,
      false: httpLink,
    })
  : httpLink;

export const trpc = createTRPCRemix({
  config: () => ({
    queryClientConfig: {
      defaultOptions: {
        queries: {
          staleTime: 15_000,
        },
      },
    },
    links: [link],
  }),
});

type QueryClientConfig = ConstructorParameters<typeof QueryClient>[0];

type WithTRPCConfig = CreateTRPCClientOptions<AppRouter> & {
  queryClientConfig?: QueryClientConfig;
};

interface WithTRPCOptions {
  config: (info: Record<never, never>) => WithTRPCConfig;
}

interface WithTRPCNoSSROptions extends WithTRPCOptions {
  ssr?: false;
}

function withTRPC(
  opts: WithTRPCNoSSROptions,
): (Component: React.FC) => React.ComponentType {
  const { config: getClientConfig } = opts;
  const trpc = createTRPCReact<AppRouter>();

  return (Component: React.FC) => {
    const WithTRPC = (props: Record<never, never>) => {
      const [{ queryClient, trpcClient }] = useState(() => {
        const config = getClientConfig({});
        const queryClient = new QueryClient(config.queryClientConfig);
        const trpcClient = trpc.createClient(config);
        return {
          queryClient,
          trpcClient,
        };
      });

      return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <Component {...props} />
          </QueryClientProvider>
        </trpc.Provider>
      );
    };

    const displayName = Component.displayName || Component.name || "Component";
    WithTRPC.displayName = `withTRPC(${displayName})`;

    return WithTRPC;
  };
}
