import { ActionKind, ActionGroup } from "./action";

export class NavigationKind extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      back: () => this.back(),
      forward: () => this.forward()
    };
  }

  protected back(): null {
    this.browser.tabs.executeScript({
      code: "history.back();"
    });
    return null;
  }

  protected forward(): null {
    this.browser.tabs.executeScript({
      code: "history.forward();"
    });
    return null;
  }
}
