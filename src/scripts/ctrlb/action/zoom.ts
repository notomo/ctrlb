import { ActionArgs, ActionKind, ActionGroup } from "./action";

export class ZoomKind extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      set: {
        f: (args: ActionArgs) => {
          this.set(
            this.has({ zoomFactor: this.requiredNumber }, args).zoomFactor
          );
        }
      },
      up: () => this.up(),
      down: () => this.down(),
      reset: () => this.reset()
    };
  }

  protected set(zoomFactor: number): void {
    this.browser.tabs.setZoom(zoomFactor);
  }

  protected reset(): void {
    this.browser.tabs.setZoom(0);
  }

  protected async up(): Promise<void> {
    const currentZoomFactor = await this.browser.tabs.getZoom();
    this.browser.tabs.setZoom(currentZoomFactor + 0.1);
  }

  protected async down(): Promise<void> {
    const zoomFactor = (await this.browser.tabs.getZoom()) - 0.1;
    if (zoomFactor < 0.1) {
      return;
    }
    this.browser.tabs.setZoom(zoomFactor);
  }
}
