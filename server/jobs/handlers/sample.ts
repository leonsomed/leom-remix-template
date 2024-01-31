export interface SampleJob {
  type: "sample";
  payload: number;
}

export function sampleHanlder(job: SampleJob) {
  console.log("Running sample job", job);
}
