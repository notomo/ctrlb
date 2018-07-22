import { Action, ActionInvoker } from "./action";
import { Tabs } from "webextension-polyfill-ts";

export class ScrollActionGroup {
  constructor(protected readonly tabs: Tabs.Static) {}

  public toTop(): null {
    this.tabs.executeScript({
      code: "window.scrollTo(window.scrollX, 0);"
    });
    return null;
  }

  public toBottom(): null {
    this.tabs.executeScript({
      code: "window.scrollTo(window.scrollX, document.body.scrollHeight);"
    });
    return null;
  }

  public up(): null {
    this.tabs.executeScript({
      code: "window.scrollBy(0, -50);"
    });
    return null;
  }

  public down(): null {
    this.tabs.executeScript({
      code: "window.scrollBy(0, 50);"
    });
    return null;
  }
}

export class ScrollActionInvoker extends ActionInvoker<ScrollActionGroup> {
  public readonly toTop: Action;
  public readonly toBottom: Action;
  public readonly up: Action;
  public readonly down: Action;

  constructor(actionGroup: ScrollActionGroup) {
    super(actionGroup);

    const noArgsActions = {
      toTop: actionGroup.toTop,
      toBottom: actionGroup.toBottom,
      up: actionGroup.up,
      down: actionGroup.down
    };

    this.toTop = this.noArgsAction(noArgsActions, "toTop");
    this.toBottom = this.noArgsAction(noArgsActions, "toBottom");
    this.up = this.noArgsAction(noArgsActions, "up");
    this.down = this.noArgsAction(noArgsActions, "down");
  }
}
