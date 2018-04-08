import { ActionArgs, ActionKind, ActionGroup, ResultInfo } from "./action";

export class Navigation extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      back: (args: ActionArgs) => this.back(args),
      forward: (args: ActionArgs) => this.forward(args)
    };
  }

  protected back(args: ActionArgs): ResultInfo {
    this.chrome.tabs.executeScript({
      code: "history.back();"
    });
    return { status: "ok" };
  }

  protected forward(args: ActionArgs): ResultInfo {
    this.chrome.tabs.executeScript({
      code: "history.forward();"
    });
    return { status: "ok" };
  }
}
