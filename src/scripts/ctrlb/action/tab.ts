import { Tabs } from "webextension-polyfill-ts";

export class TabActionGroup {
  constructor(protected readonly tabs: Tabs.Static) {}

  public async activate(tabId: number): Promise<null> {
    const tab = await this.tabs.get(tabId);
    this.update(tab, { active: true });
    return null;
  }

  public create(): null {
    this.tabs.create({});
    return null;
  }

  public async first(): Promise<null> {
    const tabs = await this.tabs.query({
      currentWindow: true,
      index: 0,
    });
    const tab = tabs.pop();
    if (tab !== undefined) {
      this.update(tab, { active: true });
    }
    return null;
  }

  public async next(): Promise<null> {
    const tab = await this.getCurrentTab();

    const lastTabs = await this.getLastTab();
    const lastTab = lastTabs.pop();
    if (lastTab === undefined) {
      return null;
    }
    let index: number;
    if (lastTab.index === tab.index) {
      index = 0;
    } else {
      index = (tab.index as number) + 1;
    }
    const tabs = await this.tabs.query({
      currentWindow: true,
      index: index,
    });

    const nextTab = tabs.pop();
    if (nextTab !== undefined) {
      this.update(nextTab, { active: true });
    }

    return null;
  }

  public async previous(): Promise<null> {
    const tab = await this.getCurrentTab();
    const index = tab.index as number;
    let tabs: Tabs.Tab[];
    if (index === 0) {
      tabs = await this.getLastTab();
    } else {
      tabs = await this.tabs.query({
        currentWindow: true,
        index: index - 1,
      });
    }

    const previousTab = tabs.pop();
    if (previousTab !== undefined) {
      this.update(previousTab, { active: true });
    }

    return null;
  }

  public async last(): Promise<null> {
    const lastTab = await this.getLastTab();
    const tab = lastTab.pop();
    if (tab !== undefined) {
      await this.update(tab, { active: true });
    }
    return null;
  }

  public async moveLeft(tabId: number | null): Promise<null> {
    let tab;
    if (tabId !== null) {
      tab = await this.get(tabId);
    } else {
      tab = await this.getCurrentTab();
    }

    const id = tab.id;
    if (id === undefined || tab.index === 0) {
      return null;
    }

    await this.tabs.move(id, { index: tab.index - 1 });
    return null;
  }

  public async moveRight(tabId: number | null): Promise<null> {
    let tab;
    if (tabId !== null) {
      tab = await this.get(tabId);
    } else {
      tab = await this.getCurrentTab();
    }

    const id = tab.id;
    if (id === undefined) {
      return null;
    }

    await this.tabs.move(id, { index: tab.index + 1 });
    return null;
  }

  public async moveFirst(tabId: number | null): Promise<null> {
    return this.executeWithIdOrCurrent(tabId, (tabId: number) => {
      this.tabs.move(tabId, { index: 0 });
    });
  }

  public async moveLast(tabId: number | null): Promise<null> {
    return this.executeWithIdOrCurrent(tabId, (tabId: number) => {
      this.tabs.move(tabId, { index: -1 });
    });
  }

  public async close(tabId: number | null): Promise<null> {
    return this.executeWithIdOrCurrent(tabId, (tabId: number) => {
      this.tabs.remove(tabId);
    });
  }

  public async closeOthers(): Promise<null> {
    const tab = await this.getCurrentTab();
    const tabId = tab.id as number;
    const tabs = await this.tabs.query({
      currentWindow: true,
      pinned: false,
    });

    const tabIds = tabs
      .filter((tab: Tabs.Tab) => {
        return tab.id !== tabId;
      })
      .map((tab: Tabs.Tab) => {
        return tab.id as number;
      });
    this.tabs.remove(tabIds);

    return null;
  }

  public async closeRight(): Promise<null> {
    const tab = await this.getCurrentTab();
    const index = tab.index as number;
    const tabs = await this.tabs.query({
      currentWindow: true,
      pinned: false,
    });

    const tabIds = tabs
      .filter((tab: Tabs.Tab) => {
        return tab.index > index;
      })
      .map((tab: Tabs.Tab) => {
        return tab.id as number;
      });
    this.tabs.remove(tabIds);

    return null;
  }

  public async closeLeft(): Promise<null> {
    const tab = await this.getCurrentTab();
    const index = tab.index as number;
    const tabs = await this.tabs.query({
      currentWindow: true,
      pinned: false,
    });

    const tabIds = tabs
      .filter((tab: Tabs.Tab) => {
        return tab.index < index;
      })
      .map((tab: Tabs.Tab) => {
        return tab.id as number;
      });
    this.tabs.remove(tabIds);

    return null;
  }

  public tabOpen(url: string): null {
    this.tabs.create({ url: url });
    return null;
  }

  public async open(url: string): Promise<null> {
    const tab = await this.getCurrentTab();
    this.update(tab, { url: url });
    return null;
  }

  public async duplicate(tabId: number | null): Promise<null> {
    return this.executeWithIdOrCurrent(tabId, (tabId: number) => {
      this.tabs.duplicate(tabId);
    });
  }

  public async reload(tabId: number | null): Promise<null> {
    return this.executeWithIdOrCurrent(tabId, (tabId: number) => {
      this.tabs.reload(tabId);
    });
  }

  protected async executeWithIdOrCurrent(
    tabId: number | null,
    fun: { (tabId: number): void }
  ): Promise<null> {
    if (tabId !== null) {
      fun(tabId);
      return null;
    }

    const tab = await this.getCurrentTab();
    const id = tab.id;
    if (id === undefined) {
      return null;
    }

    fun(id);
    return null;
  }

  public async listAll(): Promise<Tabs.Tab[]> {
    return await this.tabs.query({});
  }

  public async list(): Promise<Tabs.Tab[]> {
    return await this.tabs.query({ currentWindow: true });
  }

  public async get(tabId: number): Promise<Tabs.Tab> {
    return await this.tabs.get(tabId);
  }

  public async getCurrent(): Promise<Tabs.Tab | null> {
    const tabs = await this.tabs.query({
      currentWindow: true,
      active: true,
    });
    const tab = tabs.pop();
    if (tab === undefined) {
      return null;
    }
    return tab;
  }

  private async update(tab: Tabs.Tab, properties: any) {
    const tabId = tab.id as number;
    return this.tabs.update(tabId, properties);
  }

  // TODO: return Tab or null
  private async getCurrentTab(): Promise<Tabs.Tab> {
    const tabs = await this.tabs.query({
      currentWindow: true,
      active: true,
    });
    return tabs.pop() as Tabs.Tab;
  }

  private async getLastTab(): Promise<Tabs.Tab[]> {
    const tabs = await this.tabs.query({ currentWindow: true });
    const indexes = tabs.map((tab: Tabs.Tab) => {
      return tab.index;
    });
    indexes.push(-1);
    const index = Math.max.apply(null, indexes);
    if (index === -1) {
      return [];
    }
    return this.tabs.query({ index: index, currentWindow: true });
  }
}
