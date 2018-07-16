import { ActionKind, ActionGroup } from "./action";

export class ScrollKind extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      toTop: () => this.toTop(),
      toBottom: () => this.toBottom(),
      up: () => this.up(),
      down: () => this.down()
    };
  }

  protected toTop(): void {
    this.browser.tabs.executeScript({
      code: "window.scrollTo(window.scrollX, 0);"
    });
  }

  protected toBottom(): void {
    this.browser.tabs.executeScript({
      code: "window.scrollTo(window.scrollX, document.body.scrollHeight);"
    });
  }

  protected up(): void {
    this.browser.tabs.executeScript({
      code: "window.scrollBy(0, -50);"
    });
  }

  protected down(): void {
    this.browser.tabs.executeScript({
      code: "window.scrollBy(0, 50);"
    });
  }
}
