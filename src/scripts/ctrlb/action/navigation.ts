import { ActionKind, ActionGroup } from "./action";

export class NavigationKind extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      back: () => this.back(),
      forward: () => this.forward()
    };
  }

  protected back(): void {
    this.browser.tabs.executeScript({
      code: "history.back();"
    });
  }

  protected forward(): void {
    this.browser.tabs.executeScript({
      code: "history.forward();"
    });
  }
}
