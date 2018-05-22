import { ActionArgs, ActionKind, ActionGroup, ResultInfo } from "./action";

export class Zoom extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      set: (args: ActionArgs) => this.set(args),
      up: (args: ActionArgs) => this.up(args),
      down: (args: ActionArgs) => this.down(args),
      reset: (args: ActionArgs) => this.reset(args)
    };
  }

  protected set(args: ActionArgs): ResultInfo {
    const zoomFactor: number = args.zoomFactor as number;
    this.chrome.tabs.setZoom(zoomFactor);
    return { status: "ok" };
  }

  protected reset(args: ActionArgs): ResultInfo {
    this.chrome.tabs.setZoom(0);
    return { status: "ok" };
  }

  protected async up(args: ActionArgs): Promise<ResultInfo> {
    const currentZoomFactor = await this.chrome.tabs.getZoom();
    this.chrome.tabs.setZoom(currentZoomFactor + 0.1);
    return { status: "ok" };
  }

  protected async down(args: ActionArgs): Promise<ResultInfo> {
    const zoomFactor = (await this.chrome.tabs.getZoom()) - 0.1;
    if (zoomFactor < 0.1) {
      return { status: "ok" };
    }
    this.chrome.tabs.setZoom(zoomFactor);
    return { status: "ok" };
  }
}
