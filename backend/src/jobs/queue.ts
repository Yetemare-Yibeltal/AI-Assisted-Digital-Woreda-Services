type JobFunction = () => Promise<void>;

interface QueuedJob {
  name: string;
  fn: JobFunction;
  retries: number;
}

class JobQueue {
  private queue: QueuedJob[] = [];
  private processing = false;

  add(name: string, fn: JobFunction, retries = 0) {
    this.queue.push({ name, fn, retries });
    this.process();
  }

  private async process() {
    if (this.processing) return;
    this.processing = true;
    while (this.queue.length > 0) {
      const job = this.queue.shift()!;
      try {
        await job.fn();
      } catch (error) {
        console.error(`Job "${job.name}" failed:`, error);
        if (job.retries > 0) {
          this.queue.push({ ...job, retries: job.retries - 1 });
        }
      }
    }
    this.processing = false;
  }
}

export const queue = new JobQueue();
