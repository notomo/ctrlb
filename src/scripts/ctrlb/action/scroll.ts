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

  protected toTop(): null {
    this.browser.tabs.executeScript({
      code: "window.scrollTo(window.scrollX, 0);"
    });
    return null;
  }

  protected toBottom(): null {
    this.browser.tabs.executeScript({
      code: "window.scrollTo(window.scrollX, document.body.scrollHeight);"
    });
    return null;
  }

  protected up(): null {
    this.browser.tabs.executeScript({
      code: "window.scrollBy(0, -50);"
    });
    return null;
  }

  protected down(): null {
    this.browser.tabs.executeScript({
      code: "window.scrollBy(0, 50);"
    });
    return null;
  }
}
