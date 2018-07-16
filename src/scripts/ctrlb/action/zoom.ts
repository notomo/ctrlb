import { ActionArgs, ActionKind, ActionGroup } from "./action";

export class ZoomKind extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      set: {
        f: (args: ActionArgs) =>
          this.set(
            this.has({ zoomFactor: this.requiredNumber }, args).zoomFactor
          )
      },
      up: () => this.up(),
      down: () => this.down(),
      reset: () => this.reset()
    };
  }

  protected set(zoomFactor: number): null {
    this.browser.tabs.setZoom(zoomFactor);
    return null;
  }

  protected reset(): null {
    this.browser.tabs.setZoom(0);
    return null;
  }

  protected async up(): Promise<null> {
    const currentZoomFactor = await this.browser.tabs.getZoom();
    this.browser.tabs.setZoom(currentZoomFactor + 0.1);
    return null;
  }

  protected async down(): Promise<null> {
    const zoomFactor = (await this.browser.tabs.getZoom()) - 0.1;
    if (zoomFactor < 0.1) {
      return null;
    }
    this.browser.tabs.setZoom(zoomFactor);
    return null;
  }
}
