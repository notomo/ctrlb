import { Action } from "./action";
import { Validator } from "./validator";
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

export class ScrollActionInvoker {
  public readonly toTop: Action;
  public readonly toBottom: Action;
  public readonly up: Action;
  public readonly down: Action;

  constructor(actionGroup: ScrollActionGroup, v: Validator) {
    this.toTop = v.noArgs(actionGroup["toTop"], actionGroup);
    this.toBottom = v.noArgs(actionGroup["toBottom"], actionGroup);
    this.up = v.noArgs(actionGroup["up"], actionGroup);
    this.down = v.noArgs(actionGroup["down"], actionGroup);
  }
}
