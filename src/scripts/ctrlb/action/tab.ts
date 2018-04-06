import { ActionArgs, ActionKind, ActionGroup, ResultInfo } from "./action";

export class Tab extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      close: (args: ActionArgs) => this.close(args),
      duplicate: (args: ActionArgs) => this.duplicate(args),
      reload: (args: ActionArgs) => this.reload(args),
      activate: (args: ActionArgs) => this.activate(args),
      list: (args: ActionArgs) => this.list(args),
      tabOpen: (args: ActionArgs) => this.tabOpen(args),
      open: (args: ActionArgs) => this.open(args)
    };
  }

  protected async activate(args: ActionArgs): Promise<ResultInfo> {
    if (args.id === undefined) {
      return { status: "invalid" };
    }
    const tabId = args.id as number;
    return await this.chrome.tabs
      .get(tabId)
      .then((tab: chrome.tabs.Tab) => {
        return this.update(tab, { active: true });
      })
      .then(() => {
        return { status: "ok" };
      });
  }

  protected close(args: ActionArgs): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: chrome.tabs.Tab) => {
      const tabId = tab.id as number;
      chrome.tabs.remove(tabId);
      return { status: "ok" };
    });
  }

  protected async tabOpen(args: ActionArgs): Promise<ResultInfo> {
    if (args.url === undefined) {
      return { status: "invalid" };
    }
    const url = args.url as string;
    return this.chrome.tabs
      .create({ url: url })
      .then((tab: chrome.tabs.Tab) => {
        return { status: "ok" };
      });
  }

  protected async open(args: ActionArgs): Promise<ResultInfo> {
    if (args.url === undefined) {
      return { status: "invalid" };
    }
    const url = args.url as string;
    return this.getCurrentTab().then((tab: chrome.tabs.Tab) => {
      this.update(tab, { url: url });
      return { status: "ok" };
    });
  }

  protected duplicate(args: ActionArgs): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: chrome.tabs.Tab) => {
      const tabId = tab.id as number;
      chrome.tabs.duplicate(tabId);
      return { status: "ok" };
    });
  }

  protected reload(args: ActionArgs): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: chrome.tabs.Tab) => {
      const tabId = tab.id as number;
      chrome.tabs.reload(tabId);
      return { status: "ok" };
    });
  }

  protected async list(args: ActionArgs): Promise<ResultInfo> {
    const tabs = await this.chrome.tabs
      .query({ currentWindow: true })
      .then((tabs: chrome.tabs.Tab[]) => {
        return { status: "ok", body: tabs };
      });
    return tabs;
  }

  private async update(tab: chrome.tabs.Tab, properties: any) {
    const tabId = tab.id as number;
    return this.chrome.tabs.update(tabId, properties);
  }

  private async getCurrentTab(): Promise<chrome.tabs.Tab> {
    return await this.chrome.tabs
      .query({ currentWindow: true, active: true })
      .then((tabs: chrome.tabs.Tab[]) => {
        return tabs.pop() as chrome.tabs.Tab;
      });
  }
}
