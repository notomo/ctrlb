import { spawn, ChildProcess } from "child_process";

export class Extension {
  protected process: ChildProcess | null = null;

  public async start() {
    this.process = spawn("npm", ["run", "ext:run"], { detached: true });
  }

  public stop() {
    if (this.process === null) {
      return;
    }

    // NOTE: kill processes in the detached group
    // https://nodejs.org/api/child_process.html#child_process_options_detached
    process.kill(-this.process.pid);
  }
}
