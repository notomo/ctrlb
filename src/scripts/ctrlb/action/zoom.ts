import { ActionArgs, Action } from "./action";
import { Validator } from "./validator";
import { Tabs } from "webextension-polyfill-ts";

export class ZoomActionGroup {
  constructor(protected readonly tabs: Tabs.Static) {}

  public set(zoomFactor: number): null {
    this.tabs.setZoom(zoomFactor);
    return null;
  }

  public reset(): null {
    this.tabs.setZoom(0);
    return null;
  }

  public async up(): Promise<null> {
    const currentZoomFactor = await this.tabs.getZoom();
    this.tabs.setZoom(currentZoomFactor + 0.1);
    return null;
  }

  public async down(): Promise<null> {
    const zoomFactor = (await this.tabs.getZoom()) - 0.1;
    if (zoomFactor < 0.1) {
      return null;
    }
    this.tabs.setZoom(zoomFactor);
    return null;
  }
}

export class ZoomActionInvoker {
  public readonly set: Action;
  public readonly reset: Action;
  public readonly up: Action;
  public readonly down: Action;

  constructor(actionGroup: ZoomActionGroup, v: Validator) {
    this.set = (args: ActionArgs) => {
      const a = v.has({ zoomFactor: v.requiredNumber() }, args);
      return actionGroup.set(a.zoomFactor);
    };
    this.reset = v.noArgs(actionGroup["reset"], actionGroup);
    this.up = v.noArgs(actionGroup["up"], actionGroup);
    this.down = v.noArgs(actionGroup["down"], actionGroup);
  }
}
