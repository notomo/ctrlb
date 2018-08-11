import { Tabs } from "webextension-polyfill-ts";
import { Action, ActionInvoker } from "./action";

export class NavigationActionGroup {
  constructor(protected readonly tabs: Tabs.Static) {}

  public back(): null {
    this.tabs.executeScript({
      code: "history.back();",
    });
    return null;
  }

  public forward(): null {
    this.tabs.executeScript({
      code: "history.forward();",
    });
    return null;
  }
}

export class NavigationActionInvoker extends ActionInvoker<
  NavigationActionGroup
> {
  public readonly back: Action;
  public readonly forward: Action;

  constructor(actionGroup: NavigationActionGroup) {
    super(actionGroup);

    const noArgsActions = {
      back: actionGroup.back,
      forward: actionGroup.forward,
    };

    this.back = this.noArgsAction(noArgsActions, "back");
    this.forward = this.noArgsAction(noArgsActions, "forward");
  }
}
