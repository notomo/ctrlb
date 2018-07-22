import { ActionArgs, Action, ActionInvoker } from "./action";

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

export class ZoomActionInvoker extends ActionInvoker<ZoomActionGroup> {
  public readonly set: Action;
  public readonly reset: Action;
  public readonly up: Action;
  public readonly down: Action;

  constructor(actionGroup: ZoomActionGroup) {
    super(actionGroup);

    this.set = (args: ActionArgs) => {
      const a = this.v.has({ zoomFactor: this.v.requiredNumber() }, args);
      return actionGroup.set(a.zoomFactor);
    };

    const noArgsActions = {
      reset: actionGroup.reset,
      up: actionGroup.up,
      down: actionGroup.down
    };

    this.reset = this.noArgsAction(noArgsActions, "reset");
    this.up = this.noArgsAction(noArgsActions, "up");
    this.down = this.noArgsAction(noArgsActions, "down");
  }
}
