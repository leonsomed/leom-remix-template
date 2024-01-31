import { Job, Worker } from "bullmq";
import { connection } from "~/server/jobs/config";
import { quickQueue, repeatableQueue, sharedQueue } from "~/server/jobs/queues";
import { SampleJob, sampleHanlder } from "~/server/jobs/handlers/sample";
import { AnotherJob, anotherHanlder } from "~/server/jobs/handlers/another";

export type JobType = SampleJob | AnotherJob;

function processJob(queueName: string) {
  console.log(`Staring worker for queue {${queueName}}`);

  return async (job: Job<JobType, void, JobType["type"]>) => {
    if (job.name !== job.data.type) {
      throw new Error(
        `Job name {${job.name}} does not match job type {${job.data.type}}`,
      );
    }

    switch (job.data.type) {
      case "sample":
        await sampleHanlder(job.data);
        break;
      case "another":
        await anotherHanlder(job.data);
        break;
      default:
        // @ts-expect-error - just to ensure we don't forget to add a case
        throw new Error(`Unknown job {${job.data.type}}`);
    }
  };
}

export const sharedWorker = new Worker(
  sharedQueue.name,
  processJob(sharedQueue.name),
  {
    connection,
  },
);

export const quickWorker = new Worker(
  quickQueue.name,
  processJob(quickQueue.name),
  {
    connection,
  },
);

export const repeatableWorker = new Worker(
  repeatableQueue.name,
  processJob(repeatableQueue.name),
  {
    connection,
  },
);
