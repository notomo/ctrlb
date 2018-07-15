import { ActionArgs, ActionKind, ActionGroup } from "./action";

export class ScrollKind extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      toTop: (args: ActionArgs) => this.toTop(args),
      toBottom: (args: ActionArgs) => this.toBottom(args),
      up: (args: ActionArgs) => this.up(args),
      down: (args: ActionArgs) => this.down(args)
    };
  }

  protected toTop(args: ActionArgs): void {
    this.browser.tabs.executeScript({
      code: "window.scrollTo(window.scrollX, 0);"
    });
  }

  protected toBottom(args: ActionArgs): void {
    this.browser.tabs.executeScript({
      code: "window.scrollTo(window.scrollX, document.body.scrollHeight);"
    });
  }

  protected up(args: ActionArgs): void {
    this.browser.tabs.executeScript({
      code: "window.scrollBy(0, -50);"
    });
  }

  protected down(args: ActionArgs): void {
    this.browser.tabs.executeScript({
      code: "window.scrollBy(0, 50);"
    });
  }
}
