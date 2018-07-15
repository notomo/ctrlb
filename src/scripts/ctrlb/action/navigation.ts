import { ActionArgs, ActionKind, ActionGroup } from "./action";

export class NavigationKind extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      back: (args: ActionArgs) => this.back(args),
      forward: (args: ActionArgs) => this.forward(args)
    };
  }

  protected back(args: ActionArgs): void {
    this.browser.tabs.executeScript({
      code: "history.back();"
    });
  }

  protected forward(args: ActionArgs): void {
    this.browser.tabs.executeScript({
      code: "history.forward();"
    });
  }
}
