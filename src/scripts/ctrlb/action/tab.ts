import { ActionArgs, ActionKind, ActionGroup, ResultInfo } from "./action";
import { Tab } from "./facade";

export class TabKind extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      close: () => this.close(),
      duplicate: () => this.duplicate(),
      reload: () => this.reload(),
      activate: { f: (args: ActionArgs) => this.activate(this.hasId(args)) },
      list: () => this.list(),
      tabOpen: {
        f: (args: ActionArgs) =>
          this.tabOpen(this.has({ url: this.requiredString }, args).url)
      },
      open: {
        f: (args: ActionArgs) =>
          this.open(this.has({ url: this.requiredString }, args).url)
      },
      next: () => this.next(),
      previous: () => this.previous(),
      first: () => this.first(),
      last: () => this.last(),
      create: () => this.create(),
      closeOthers: () => this.closeOthers(),
      closeRight: () => this.closeRight(),
      closeLeft: () => this.closeLeft(),
      moveLeft: () => this.moveLeft(),
      moveRight: () => this.moveRight(),
      moveFirst: () => this.moveFirst(),
      moveLast: () => this.moveLast(),
      get: { f: (args: ActionArgs) => this.get(this.hasId(args)) }
    };
  }

  protected async activate(tabId: number): Promise<null> {
    const tab = await this.browser.tabs.get(tabId);
    this.update(tab, { active: true });
    return null;
  }

  protected create(): null {
    this.browser.tabs.create({});
    return null;
  }

  protected async first(): Promise<null> {
    const tabs = await this.browser.tabs.query({
      currentWindow: true,
      index: 0
    });
    const tab = tabs.pop();
    if (tab !== undefined) {
      this.update(tab, { active: true });
    }
    return null;
  }

  protected async next(): Promise<null> {
    const tab = await this.getCurrentTab();

    const lastTabs = await this.getLastTab();
    const lastTab = lastTabs.pop();
    if (lastTab === undefined) {
      return null;
    }
    var index: number;
    if (lastTab.index === tab.index) {
      index = 0;
    } else {
      index = (tab.index as number) + 1;
    }
    const tabs = await this.browser.tabs.query({
      currentWindow: true,
      index: index
    });

    const nextTab = tabs.pop();
    if (nextTab !== undefined) {
      this.update(nextTab, { active: true });
    }

    return null;
  }

  protected async previous(): Promise<null> {
    const tab = await this.getCurrentTab();
    const index = tab.index as number;
    let tabs: Tab[];
    if (index === 0) {
      tabs = await this.getLastTab();
    } else {
      tabs = await this.browser.tabs.query({
        currentWindow: true,
        index: index - 1
      });
    }

    const previousTab = tabs.pop();
    if (previousTab !== undefined) {
      this.update(previousTab, { active: true });
    }

    return null;
  }

  protected async last(): Promise<null> {
    const lastTab = await this.getLastTab();
    const tab = lastTab.pop();
    if (tab !== undefined) {
      await this.update(tab, { active: true });
    }
    return null;
  }

  protected async moveLeft(): Promise<null> {
    const tab = await this.getCurrentTab();
    if (tab.index > 0) {
      const id = tab.id as number;
      this.browser.tabs.move(id, { index: tab.index - 1 });
    }
    return null;
  }

  protected async moveRight(): Promise<null> {
    const tab = await this.getCurrentTab();
    const id = tab.id as number;
    this.browser.tabs.move(id, { index: tab.index + 1 });
    return null;
  }

  protected async moveFirst(): Promise<null> {
    const tab = await this.getCurrentTab();
    const id = tab.id as number;
    this.browser.tabs.move(id, { index: 0 });
    return null;
  }

  protected async moveLast(): Promise<null> {
    const tab = await this.getCurrentTab();
    const id = tab.id as number;
    this.browser.tabs.move(id, { index: -1 });
    return null;
  }

  protected async close(): Promise<null> {
    const tab = await this.getCurrentTab();
    const tabId = tab.id as number;
    this.browser.tabs.remove(tabId);
    return null;
  }

  protected async closeOthers(): Promise<null> {
    const tab = await this.getCurrentTab();
    const tabId = tab.id as number;
    const tabs = await this.browser.tabs.query({
      currentWindow: true,
      pinned: false
    });

    const tabIds = tabs
      .filter((tab: Tab) => {
        return tab.id !== tabId;
      })
      .map((tab: Tab) => {
        return tab.id as number;
      });
    this.browser.tabs.remove(tabIds);

    return null;
  }

  protected async closeRight(): Promise<null> {
    const tab = await this.getCurrentTab();
    const index = tab.index as number;
    const tabs = await this.browser.tabs.query({
      currentWindow: true,
      pinned: false
    });

    const tabIds = tabs
      .filter((tab: Tab) => {
        return tab.index > index;
      })
      .map((tab: Tab) => {
        return tab.id as number;
      });
    this.browser.tabs.remove(tabIds);

    return null;
  }

  protected async closeLeft(): Promise<null> {
    const tab = await this.getCurrentTab();
    const index = tab.index as number;
    const tabs = await this.browser.tabs.query({
      currentWindow: true,
      pinned: false
    });

    const tabIds = tabs
      .filter((tab: Tab) => {
        return tab.index < index;
      })
      .map((tab: Tab) => {
        return tab.id as number;
      });
    this.browser.tabs.remove(tabIds);

    return null;
  }

  protected tabOpen(url: string): null {
    this.browser.tabs.create({ url: url });
    return null;
  }

  protected async open(url: string): Promise<null> {
    const tab = await this.getCurrentTab();
    this.update(tab, { url: url });
    return null;
  }

  protected async duplicate(): Promise<null> {
    const tab = await this.getCurrentTab();
    const tabId = tab.id as number;
    this.browser.tabs.duplicate(tabId);
    return null;
  }

  protected async reload(): Promise<null> {
    const tab = await this.getCurrentTab();
    const tabId = tab.id as number;
    this.browser.tabs.reload(tabId);
    return null;
  }

  protected async list(): Promise<ResultInfo> {
    const tabs = await this.browser.tabs.query({ currentWindow: true });
    return { body: tabs };
  }

  protected async get(tabId: number): Promise<ResultInfo> {
    const tab = await this.browser.tabs.get(tabId);
    return { body: tab };
  }

  private async update(tab: Tab, properties: any) {
    const tabId = tab.id as number;
    return this.browser.tabs.update(tabId, properties);
  }

  private async getCurrentTab(): Promise<Tab> {
    const tabs = await this.browser.tabs.query({
      currentWindow: true,
      active: true
    });
    return tabs.pop() as Tab;
  }

  private async getLastTab(): Promise<Tab[]> {
    const tabs = await this.browser.tabs.query({ currentWindow: true });
    const indexes = tabs.map((tab: Tab) => {
      return tab.index;
    });
    indexes.push(-1);
    const index = Math.max.apply(null, indexes);
    if (index === -1) {
      return [];
    }
    return this.browser.tabs.query({ index: index, currentWindow: true });
  }
}
