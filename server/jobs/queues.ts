import { Queue } from "bullmq";
import { connection } from "~/server/jobs/config";
import type { JobType } from "./workers";

export const sharedQueue = new Queue<JobType, void, JobType["type"]>("shared", {
  connection,
});
export const quickQueue = new Queue<JobType, void, JobType["type"]>("quick", {
  connection,
});
export const repeatableQueue = new Queue<JobType, void, JobType["type"]>(
  "repeatable",
  {
    connection,
  },
);
