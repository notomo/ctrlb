import { ActionArgs, ActionKind, ActionGroup, ResultInfo } from "./action";

export class ZoomKind extends ActionKind {
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
    this.browser.tabs.setZoom(zoomFactor);
    return { status: "ok" };
  }

  protected reset(args: ActionArgs): ResultInfo {
    this.browser.tabs.setZoom(0);
    return { status: "ok" };
  }

  protected async up(args: ActionArgs): Promise<ResultInfo> {
    const currentZoomFactor = await this.browser.tabs.getZoom();
    this.browser.tabs.setZoom(currentZoomFactor + 0.1);
    return { status: "ok" };
  }

  protected async down(args: ActionArgs): Promise<ResultInfo> {
    const zoomFactor = (await this.browser.tabs.getZoom()) - 0.1;
    if (zoomFactor < 0.1) {
      return { status: "ok" };
    }
    this.browser.tabs.setZoom(zoomFactor);
    return { status: "ok" };
  }
}
