import { ActionArgs, ActionKind, ActionGroup, ResultInfo } from "./action";

export class ScrollKind extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      toTop: (args: ActionArgs) => this.toTop(args),
      toBottom: (args: ActionArgs) => this.toBottom(args),
      up: (args: ActionArgs) => this.up(args),
      down: (args: ActionArgs) => this.down(args)
    };
  }

  protected toTop(args: ActionArgs): ResultInfo {
    this.browser.tabs.executeScript({
      code: "window.scrollTo(window.scrollX, 0);"
    });
    return { status: "ok" };
  }

  protected toBottom(args: ActionArgs): ResultInfo {
    this.browser.tabs.executeScript({
      code: "window.scrollTo(window.scrollX, document.body.scrollHeight);"
    });
    return { status: "ok" };
  }

  protected up(args: ActionArgs): ResultInfo {
    this.browser.tabs.executeScript({
      code: "window.scrollBy(0, -50);"
    });
    return { status: "ok" };
  }

  protected down(args: ActionArgs): ResultInfo {
    this.browser.tabs.executeScript({
      code: "window.scrollBy(0, 50);"
    });
    return { status: "ok" };
  }
}
