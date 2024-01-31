import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
} from "@remix-run/react";
import { trpc } from "~/app/utils/trpc";

import stylesheet from "./tailwind.css";
import { SUPABASE_CONFIG, TRPC_CONFIG, WS_CONFIG } from "~/server/serverConfig";
import { useLayoutEffect } from "react";
import { supabaseClient } from "./utils/supabase";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

interface WindowEnv {
  SUPABASE_PROJECT_URL: string;
  SUPABASE_PUBLIC_ANON_KEY: string;
  TRPC_SERVER_URL: string;
  WS_SERVER_URL: string;
  APP_ACCESS_TOKEN_COOKIE_NAME: string;
  APP_REFRESH_TOKEN_COOKIE_NAME: string;
}

declare global {
  interface Window {
    ENV: WindowEnv;
  }
}

export async function loader() {
  const env: WindowEnv = {
    SUPABASE_PROJECT_URL: SUPABASE_CONFIG.PROJECT_URL,
    SUPABASE_PUBLIC_ANON_KEY: SUPABASE_CONFIG.PUBLIC_ANON_KEY,
    TRPC_SERVER_URL: TRPC_CONFIG.SERVER_URL,
    WS_SERVER_URL: WS_CONFIG.SERVER_URL,
    APP_ACCESS_TOKEN_COOKIE_NAME: SUPABASE_CONFIG.APP_ACCESS_TOKEN_COOKIE_NAME,
    APP_REFRESH_TOKEN_COOKIE_NAME:
      SUPABASE_CONFIG.APP_REFRESH_TOKEN_COOKIE_NAME,
  };

  return json({
    env,
  });
}

function App() {
  const data = useLoaderData<typeof loader>();

  useLayoutEffect(() => {
    supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // 100 years, never expires
        const maxAge = 100 * 365 * 24 * 60 * 60;
        document.cookie = `${window.ENV.APP_ACCESS_TOKEN_COOKIE_NAME}=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; secure`;
        document.cookie = `${window.ENV.APP_REFRESH_TOKEN_COOKIE_NAME}=${session.refresh_token}; path=/; max-age=${maxAge}; SameSite=Lax; secure`;
      } else {
        // delete cookies on sign out
        const expires = new Date(0).toUTCString();
        document.cookie = `${window.ENV.APP_ACCESS_TOKEN_COOKIE_NAME}=; path=/; expires=${expires}; SameSite=Lax; secure`;
        document.cookie = `${window.ENV.APP_REFRESH_TOKEN_COOKIE_NAME}=; path=/; expires=${expires}; SameSite=Lax; secure`;
      }
    });
  });

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(
              data.env,
            )}; window.process = {env: {__no_envs__: true}};`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default trpc.withTRPC(App);
