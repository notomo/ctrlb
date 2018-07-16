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

  protected async activate(tabId: number): Promise<ResultInfo> {
    return await this.browser.tabs
      .get(tabId)
      .then((tab: Tab) => {
        return this.update(tab, { active: true });
      })
      .then(() => {
        return {};
      });
  }

  protected create(): void {
    this.browser.tabs.create({});
  }

  protected async first(): Promise<ResultInfo> {
    return this.browser.tabs
      .query({ currentWindow: true, index: 0 })
      .then((tabs: Tab[]) => {
        const tab = tabs.pop();
        if (tab !== undefined) {
          this.update(tab, { active: true });
        }
        return {};
      });
  }

  protected async next(): Promise<ResultInfo> {
    return this.getCurrentTab()
      .then(async (tab: Tab) => {
        const lastTabs = await this.getLastTab();
        const lastTab = lastTabs.pop();
        if (lastTab === undefined) {
          return [];
        }
        var index: number;
        if (lastTab.index === tab.index) {
          index = 0;
        } else {
          index = (tab.index as number) + 1;
        }
        return this.browser.tabs.query({
          currentWindow: true,
          index: index
        });
      })
      .then((tabs: Tab[]) => {
        const tab = tabs.pop();
        if (tab !== undefined) {
          this.update(tab, { active: true });
        }
        return {};
      });
  }

  protected async previous(): Promise<ResultInfo> {
    return this.getCurrentTab()
      .then((tab: Tab) => {
        const index = tab.index as number;
        if (index === 0) {
          return this.getLastTab();
        }
        return this.browser.tabs.query({
          currentWindow: true,
          index: index - 1
        });
      })
      .then((tabs: Tab[]) => {
        const tab = tabs.pop();
        if (tab !== undefined) {
          this.update(tab, { active: true });
        }
        return {};
      });
  }

  protected async last(): Promise<void> {
    const lastTab = await this.getLastTab();
    const tab = lastTab.pop();
    if (tab !== undefined) {
      this.update(tab, { active: true });
    }
  }

  protected moveLeft(): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: Tab) => {
      if (tab.index > 0) {
        const id = tab.id as number;
        this.browser.tabs.move(id, { index: tab.index - 1 });
      }
      return {};
    });
  }

  protected moveRight(): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: Tab) => {
      const id = tab.id as number;
      this.browser.tabs.move(id, { index: tab.index + 1 });
      return {};
    });
  }

  protected moveFirst(): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: Tab) => {
      const id = tab.id as number;
      this.browser.tabs.move(id, { index: 0 });
      return {};
    });
  }

  protected moveLast(): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: Tab) => {
      const id = tab.id as number;
      this.browser.tabs.move(id, { index: -1 });
      return {};
    });
  }

  protected close(): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: Tab) => {
      const tabId = tab.id as number;
      this.browser.tabs.remove(tabId);
      return {};
    });
  }

  protected closeOthers(): Promise<ResultInfo> {
    return this.getCurrentTab()
      .then(async (tab: Tab) => {
        const tabId = tab.id as number;
        const tabs = await this.browser.tabs.query({
          currentWindow: true,
          pinned: false
        });
        return tabs.filter((tab: Tab) => {
          return tab.id !== tabId;
        });
      })
      .then((tabs: Tab[]) => {
        const tabIds = tabs.map((tab: Tab) => {
          return tab.id as number;
        });
        this.browser.tabs.remove(tabIds);
        return {};
      });
  }

  protected closeRight(): Promise<ResultInfo> {
    return this.getCurrentTab()
      .then(async (tab: Tab) => {
        const index = tab.index as number;
        const tabs = await this.browser.tabs.query({
          currentWindow: true,
          pinned: false
        });
        return tabs.filter((tab: Tab) => {
          return tab.index > index;
        });
      })
      .then((tabs: Tab[]) => {
        const tabIds = tabs.map((tab: Tab) => {
          return tab.id as number;
        });
        this.browser.tabs.remove(tabIds);
        return {};
      });
  }

  protected closeLeft(): Promise<ResultInfo> {
    return this.getCurrentTab()
      .then(async (tab: Tab) => {
        const index = tab.index as number;
        const tabs = await this.browser.tabs.query({
          currentWindow: true,
          pinned: false
        });
        return tabs.filter((tab: Tab) => {
          return tab.index < index;
        });
      })
      .then((tabs: Tab[]) => {
        const tabIds = tabs.map((tab: Tab) => {
          return tab.id as number;
        });
        this.browser.tabs.remove(tabIds);
        return {};
      });
  }

  protected async tabOpen(url: string): Promise<ResultInfo> {
    return this.browser.tabs.create({ url: url }).then((tab: Tab) => {
      return {};
    });
  }

  protected async open(url: string): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: Tab) => {
      this.update(tab, { url: url });
      return {};
    });
  }

  protected duplicate(): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: Tab) => {
      const tabId = tab.id as number;
      this.browser.tabs.duplicate(tabId);
      return {};
    });
  }

  protected reload(): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: Tab) => {
      const tabId = tab.id as number;
      this.browser.tabs.reload(tabId);
      return {};
    });
  }

  protected async list(): Promise<ResultInfo> {
    const tabs = await this.browser.tabs
      .query({ currentWindow: true })
      .then((tabs: Tab[]) => {
        return { body: tabs };
      });
    return tabs;
  }

  protected async get(tabId: number): Promise<ResultInfo> {
    const tab = await this.browser.tabs.get(tabId).then((tab: Tab) => {
      return { body: tab };
    });
    return tab;
  }

  private async update(tab: Tab, properties: any) {
    const tabId = tab.id as number;
    return this.browser.tabs.update(tabId, properties);
  }

  private async getCurrentTab(): Promise<Tab> {
    return await this.browser.tabs
      .query({ currentWindow: true, active: true })
      .then((tabs: Tab[]) => {
        return tabs.pop() as Tab;
      });
  }

  private async getLastTab(): Promise<Tab[]> {
    return this.browser.tabs
      .query({ currentWindow: true })
      .then((tabs: Tab[]) => {
        const indexes = tabs.map((tab: Tab) => {
          return tab.index;
        });
        indexes.push(-1);
        const index = Math.max.apply(null, indexes);
        if (index === -1) {
          return [];
        }
        return this.browser.tabs.query({ index: index });
      });
  }
}
