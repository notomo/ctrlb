import { Validator } from "./validator";
import { Tabs } from "webextension-polyfill-ts";
import { Action } from "./action";

export class NavigationActionGroup {
  constructor(protected readonly tabs: Tabs.Static) {}

  public back(): null {
    this.tabs.executeScript({
      code: "history.back();"
    });
    return null;
  }

  public forward(): null {
    this.tabs.executeScript({
      code: "history.forward();"
    });
    return null;
  }
}

export class NavigationActionInvoker {
  public readonly back: Action;
  public readonly forward: Action;

  constructor(actionGroup: NavigationActionGroup, v: Validator) {
    this.back = v.noArgs(actionGroup["back"], actionGroup);
    this.forward = v.noArgs(actionGroup["forward"], actionGroup);
  }
}
