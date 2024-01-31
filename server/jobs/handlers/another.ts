export interface AnotherJob {
  type: "another";
  payload: string;
}

export function anotherHanlder(job: AnotherJob) {
  console.log("Running another job", job);
}
