import { ActionInfo, ActionKind, ActionGroup, ResultInfo } from "./action";

export class Tab extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      close: (info: ActionInfo) => this.close(info),
      duplicate: (info: ActionInfo) => this.duplicate(info),
      reload: (info: ActionInfo) => this.reload(info),
      activate: (info: ActionInfo) => this.activate(info),
      list: (info: ActionInfo) => this.list(info)
    };
  }

  protected activate(info: ActionInfo): ResultInfo {
    if (info.args === undefined) {
      return { status: "invalid" };
    }
    const tabId = info.args["id"] as number;
    chrome.tabs.get(tabId, (tab: chrome.tabs.Tab) =>
      this.update(tab, { active: true })
    );
    return { status: "ok" };
  }

  protected close(info: ActionInfo): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: chrome.tabs.Tab) => {
      const tabId = tab.id as number;
      chrome.tabs.remove(tabId);
      return { status: "ok" };
    });
  }

  protected duplicate(info: ActionInfo): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: chrome.tabs.Tab) => {
      const tabId = tab.id as number;
      chrome.tabs.duplicate(tabId);
      return { status: "ok" };
    });
  }

  protected reload(info: ActionInfo): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: chrome.tabs.Tab) => {
      const tabId = tab.id as number;
      chrome.tabs.reload(tabId);
      return { status: "ok" };
    });
  }

  protected async list(info: ActionInfo): Promise<ResultInfo> {
    const tabs = await this.chrome.tabs
      .query({ currentWindow: true })
      .then((tabs: chrome.tabs.Tab[]) => {
        return { status: "ok", body: tabs };
      });
    return tabs;
  }

  private update(tab: chrome.tabs.Tab, properties: any) {
    const tabId = tab.id as number;
    chrome.tabs.update(tabId, properties);
  }

  private async getCurrentTab(): Promise<chrome.tabs.Tab> {
    return await this.chrome.tabs
      .query({ currentWindow: true, active: true })
      .then((tabs: chrome.tabs.Tab[]) => {
        return tabs.pop() as chrome.tabs.Tab;
      });
  }
}
