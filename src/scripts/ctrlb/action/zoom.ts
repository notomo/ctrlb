import { ActionArgs, ActionKind, ActionGroup } from "./action";

export class ZoomKind extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      set: (args: ActionArgs) => this.set(args),
      up: (args: ActionArgs) => this.up(args),
      down: (args: ActionArgs) => this.down(args),
      reset: (args: ActionArgs) => this.reset(args)
    };
  }

  protected set(args: ActionArgs): void {
    const zoomFactor: number = args.zoomFactor as number;
    this.browser.tabs.setZoom(zoomFactor);
  }

  protected reset(args: ActionArgs): void {
    this.browser.tabs.setZoom(0);
  }

  protected async up(args: ActionArgs): Promise<void> {
    const currentZoomFactor = await this.browser.tabs.getZoom();
    this.browser.tabs.setZoom(currentZoomFactor + 0.1);
  }

  protected async down(args: ActionArgs): Promise<void> {
    const zoomFactor = (await this.browser.tabs.getZoom()) - 0.1;
    if (zoomFactor < 0.1) {
      return;
    }
    this.browser.tabs.setZoom(zoomFactor);
  }
}
