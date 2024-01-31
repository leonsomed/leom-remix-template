import * as serverBuild from "../build/index.js";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { appRouter } from "~/server/trpc/router";
import { createContext } from "~/server/trpc";
import { WebSocketServer } from "ws";
import { TRPC_CONFIG } from "~/server/serverConfig";
import http from "http";
import { ServerBuild, broadcastDevReady } from "@remix-run/node";
import express from "express";
import { createRequestHandler } from "@remix-run/express";
import {
  quickWorker,
  repeatableWorker,
  sharedWorker,
} from "~/server/jobs/workers";
import { repeatableQueue } from "./jobs/queues.js";

async function run() {
  const build = serverBuild as unknown as ServerBuild;

  const server = http.createServer();
  const wss = new WebSocketServer({
    server: server,
    perMessageDeflate: false,
  });

  const handler = applyWSSHandler({
    wss,
    router: appRouter,
    createContext: ({ req }) => {
      const headers = new Headers(req.headers as HeadersInit);
      return createContext(headers);
    },
  });

  const app = express();

  app.use(express.static("public"));

  app.all(
    "*",
    createRequestHandler({
      build,
    }),
  );

  server.on("request", app);

  server.listen(TRPC_CONFIG.API_PORT, function () {
    if (process.env.NODE_ENV === "development") {
      broadcastDevReady(build);
    }
    console.log(`✅ Server listening on ${TRPC_CONFIG.API_PORT}`);
  });

  await repeatableQueue.add(
    "sample",
    { type: "sample", payload: 1 },
    {
      repeat: {
        every: 10_000,
      },
    },
  );

  process.on("SIGTERM", () => {
    handler.broadcastReconnectNotification();
    wss.close();
    server.close();
    sharedWorker.close();
    quickWorker.close();
    repeatableWorker.close();
  });
}

run();
