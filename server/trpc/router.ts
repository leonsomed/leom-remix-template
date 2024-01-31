import { PrismaClient } from "@prisma/client";
import { createTRPCLoader } from "~/server/trpc/remix/trpcLoader";
import { observable } from "@trpc/server/observable";
import { Events } from "~/server/pubsub";
import { t } from "~/server/trpc";
import type { AddTodoEvent } from "~/server/events";
import { sharedQueue } from "../jobs/queues";

const prisma = new PrismaClient();

export const appRouter = t.router({
  onTodo: t.procedure.subscription(() => {
    return observable<AddTodoEvent>((observer) => {
      const token = Events.subscribe("addTodo", (data: AddTodoEvent) => {
        observer.next(data);
      });

      return () => {
        Events.unsubscribe(token);
      };
    });
  }),
  todo: t.procedure.query(() => {
    return "todo";
  }),
  addTodo: t.procedure.mutation(async () => {
    await prisma.test.create({ data: { name: "hello" } });

    await sharedQueue.add("sample", { type: "sample", payload: 1 });

    Events.publish({
      type: "addTodo",
      id: Math.random().toString(),
      text: "hello1",
    });
  }),
});

export type AppRouter = typeof appRouter;

export const trpcLoader = createTRPCLoader(appRouter);
