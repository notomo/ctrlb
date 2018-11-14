import { BrowserAction } from "webextension-polyfill-ts";

export class Button {
  protected readonly ENABLE_ICON = "images/icon-19.png";
  protected readonly DISABLE_ICON = "images/icon-19-gray.png";

  constructor(protected readonly browserAction: BrowserAction.Static) {}

  public enable() {
    this.browserAction.setIcon({ path: this.ENABLE_ICON });
  }

  public disable() {
    this.browserAction.setIcon({ path: this.DISABLE_ICON });
  }
}
