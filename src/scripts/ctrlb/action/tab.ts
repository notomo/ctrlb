import { ActionArgs, Action, ActionInvoker } from "./action";
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

  public async moveLeft(): Promise<null> {
    const tab = await this.getCurrentTab();
    if (tab.index > 0) {
      const id = tab.id as number;
      this.tabs.move(id, { index: tab.index - 1 });
    }
    return null;
  }

  public async moveRight(): Promise<null> {
    const tab = await this.getCurrentTab();
    const id = tab.id as number;
    this.tabs.move(id, { index: tab.index + 1 });
    return null;
  }

  public async moveFirst(): Promise<null> {
    const tab = await this.getCurrentTab();
    const id = tab.id as number;
    this.tabs.move(id, { index: 0 });
    return null;
  }

  public async moveLast(): Promise<null> {
    const tab = await this.getCurrentTab();
    const id = tab.id as number;
    this.tabs.move(id, { index: -1 });
    return null;
  }

  public async close(): Promise<null> {
    const tab = await this.getCurrentTab();
    const tabId = tab.id as number;
    this.tabs.remove(tabId);
    return null;
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

  public async duplicate(): Promise<null> {
    const tab = await this.getCurrentTab();
    const tabId = tab.id as number;
    this.tabs.duplicate(tabId);
    return null;
  }

  public async reload(): Promise<null> {
    const tab = await this.getCurrentTab();
    const tabId = tab.id as number;
    this.tabs.reload(tabId);
    return null;
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

export class TabActionInvoker extends ActionInvoker<TabActionGroup> {
  public readonly get: Action;
  public readonly getCurrent: Action;
  public readonly activate: Action;
  public readonly tabOpen: Action;
  public readonly open: Action;
  public readonly close: Action;
  public readonly duplicate: Action;
  public readonly reload: Action;
  public readonly list: Action;
  public readonly next: Action;
  public readonly previous: Action;
  public readonly first: Action;
  public readonly last: Action;
  public readonly create: Action;
  public readonly closeOthers: Action;
  public readonly closeRight: Action;
  public readonly closeLeft: Action;
  public readonly moveLeft: Action;
  public readonly moveRight: Action;
  public readonly moveFirst: Action;
  public readonly moveLast: Action;

  constructor(actionGroup: TabActionGroup) {
    super(actionGroup);

    const idArgsActions = {
      get: actionGroup.get,
      activate: actionGroup.activate,
    };

    this.get = this.idArgsAction(idArgsActions, "get");
    this.activate = this.idArgsAction(idArgsActions, "activate");
    this.tabOpen = (args: ActionArgs) => {
      const a = this.v.has({ url: this.v.requiredString() }, args);
      return actionGroup.tabOpen(a.url);
    };
    this.open = (args: ActionArgs) => {
      const a = this.v.has({ url: this.v.requiredString() }, args);
      return actionGroup.open(a.url);
    };

    const noArgsActions = {
      close: actionGroup.close,
      duplicate: actionGroup.duplicate,
      reload: actionGroup.reload,
      list: actionGroup.list,
      next: actionGroup.next,
      previous: actionGroup.previous,
      first: actionGroup.first,
      last: actionGroup.last,
      create: actionGroup.create,
      closeOthers: actionGroup.closeOthers,
      closeRight: actionGroup.closeRight,
      closeLeft: actionGroup.closeLeft,
      moveLeft: actionGroup.moveLeft,
      moveRight: actionGroup.moveRight,
      moveFirst: actionGroup.moveFirst,
      moveLast: actionGroup.moveLast,
      getCurrent: actionGroup.getCurrent,
    };

    this.close = this.noArgsAction(noArgsActions, "close");
    this.duplicate = this.noArgsAction(noArgsActions, "duplicate");
    this.reload = this.noArgsAction(noArgsActions, "reload");
    this.list = this.noArgsAction(noArgsActions, "list");
    this.next = this.noArgsAction(noArgsActions, "next");
    this.previous = this.noArgsAction(noArgsActions, "previous");
    this.first = this.noArgsAction(noArgsActions, "first");
    this.last = this.noArgsAction(noArgsActions, "last");
    this.create = this.noArgsAction(noArgsActions, "create");
    this.closeOthers = this.noArgsAction(noArgsActions, "closeOthers");
    this.closeRight = this.noArgsAction(noArgsActions, "closeRight");
    this.closeLeft = this.noArgsAction(noArgsActions, "closeLeft");
    this.moveLeft = this.noArgsAction(noArgsActions, "moveLeft");
    this.moveRight = this.noArgsAction(noArgsActions, "moveRight");
    this.moveFirst = this.noArgsAction(noArgsActions, "moveFirst");
    this.moveLast = this.noArgsAction(noArgsActions, "moveLast");
    this.getCurrent = this.noArgsAction(noArgsActions, "getCurrent");
  }
}
