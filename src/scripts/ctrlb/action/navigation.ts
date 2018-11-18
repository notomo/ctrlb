import { Tabs } from "webextension-polyfill-ts";

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
