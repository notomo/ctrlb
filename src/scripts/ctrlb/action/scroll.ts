import { Tabs } from "webextension-polyfill-ts";

export class ScrollActionGroup {
  constructor(protected readonly tabs: Tabs.Static) {}

  public toTop(): null {
    this.tabs.executeScript({
      code: "window.scrollTo(window.scrollX, 0);",
    });
    return null;
  }

  public toBottom(): null {
    this.tabs.executeScript({
      code: "window.scrollTo(window.scrollX, document.body.scrollHeight);",
    });
    return null;
  }

  public up(): null {
    this.tabs.executeScript({
      code: "window.scrollBy(0, -50);",
    });
    return null;
  }

  public down(): null {
    this.tabs.executeScript({
      code: "window.scrollBy(0, 50);",
    });
    return null;
  }
}
