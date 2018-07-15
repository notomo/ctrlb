import { ActionArgs, ActionKind, ActionGroup, ResultInfo } from "./action";
import { Tab } from "./facade";

export class TabKind extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      close: (args: ActionArgs) => this.close(args),
      duplicate: (args: ActionArgs) => this.duplicate(args),
      reload: (args: ActionArgs) => this.reload(args),
      activate: (args: ActionArgs) => this.activate(args),
      list: (args: ActionArgs) => this.list(args),
      tabOpen: (args: ActionArgs) => this.tabOpen(args),
      open: (args: ActionArgs) => this.open(args),
      next: (args: ActionArgs) => this.next(args),
      previous: (args: ActionArgs) => this.previous(args),
      first: (args: ActionArgs) => this.first(args),
      last: (args: ActionArgs) => this.last(args),
      create: (args: ActionArgs) => this.create(args),
      closeOthers: (args: ActionArgs) => this.closeOthers(args),
      closeRight: (args: ActionArgs) => this.closeRight(args),
      closeLeft: (args: ActionArgs) => this.closeLeft(args),
      moveLeft: (args: ActionArgs) => this.moveLeft(args),
      moveRight: (args: ActionArgs) => this.moveRight(args),
      moveFirst: (args: ActionArgs) => this.moveFirst(args),
      moveLast: (args: ActionArgs) => this.moveLast(args),
      get: (args: ActionArgs) => this.get(args)
    };
  }

  protected async activate(args: ActionArgs): Promise<ResultInfo> {
    if (args.id === undefined) {
      return { };
    }
    const tabId = args.id as number;
    return await this.browser.tabs
      .get(tabId)
      .then((tab: Tab) => {
        return this.update(tab, { active: true });
      })
      .then(() => {
        return {  };
      });
  }

  protected async create(args: ActionArgs): Promise<ResultInfo> {
    return this.browser.tabs.create({}).then((tab: Tab) => {
      return {  };
    });
  }

  protected async first(args: ActionArgs): Promise<ResultInfo> {
    return this.browser.tabs
      .query({ currentWindow: true, index: 0 })
      .then((tabs: Tab[]) => {
        const tab = tabs.pop();
        if (tab !== undefined) {
          this.update(tab, { active: true });
        }
        return {  };
      });
  }

  protected async next(args: ActionArgs): Promise<ResultInfo> {
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
        return {  };
      });
  }

  protected async previous(args: ActionArgs): Promise<ResultInfo> {
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
        return {  };
      });
  }

  protected async last(args: ActionArgs): Promise<ResultInfo> {
    const lastTab = await this.getLastTab();
    const tab = lastTab.pop();
    if (tab !== undefined) {
      this.update(tab, { active: true });
    }
    return {  };
  }

  protected moveLeft(args: ActionArgs): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: Tab) => {
      if (tab.index > 0) {
        const id = tab.id as number;
        this.browser.tabs.move(id, { index: tab.index - 1 });
      }
      return {  };
    });
  }

  protected moveRight(args: ActionArgs): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: Tab) => {
      const id = tab.id as number;
      this.browser.tabs.move(id, { index: tab.index + 1 });
      return {  };
    });
  }

  protected moveFirst(args: ActionArgs): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: Tab) => {
      const id = tab.id as number;
      this.browser.tabs.move(id, { index: 0 });
      return {  };
    });
  }

  protected moveLast(args: ActionArgs): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: Tab) => {
      const id = tab.id as number;
      this.browser.tabs.move(id, { index: -1 });
      return {  };
    });
  }

  protected close(args: ActionArgs): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: Tab) => {
      const tabId = tab.id as number;
      this.browser.tabs.remove(tabId);
      return {  };
    });
  }

  protected closeOthers(args: ActionArgs): Promise<ResultInfo> {
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
        return {  };
      });
  }

  protected closeRight(args: ActionArgs): Promise<ResultInfo> {
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
        return {  };
      });
  }

  protected closeLeft(args: ActionArgs): Promise<ResultInfo> {
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
        return {  };
      });
  }

  protected async tabOpen(args: ActionArgs): Promise<ResultInfo> {
    if (args.url === undefined) {
      return { };
    }
    const url = args.url as string;
    return this.browser.tabs.create({ url: url }).then((tab: Tab) => {
      return {  };
    });
  }

  protected async open(args: ActionArgs): Promise<ResultInfo> {
    if (args.url === undefined) {
      return { };
    }
    const url = args.url as string;
    return this.getCurrentTab().then((tab: Tab) => {
      this.update(tab, { url: url });
      return {  };
    });
  }

  protected duplicate(args: ActionArgs): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: Tab) => {
      const tabId = tab.id as number;
      this.browser.tabs.duplicate(tabId);
      return {  };
    });
  }

  protected reload(args: ActionArgs): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: Tab) => {
      const tabId = tab.id as number;
      this.browser.tabs.reload(tabId);
      return {  };
    });
  }

  protected async list(args: ActionArgs): Promise<ResultInfo> {
    const tabs = await this.browser.tabs
      .query({ currentWindow: true })
      .then((tabs: Tab[]) => {
        return { body: tabs };
      });
    return tabs;
  }

  protected async get(args: ActionArgs): Promise<ResultInfo> {
    if (args.id === undefined) {
      return { };
    }
    const tabId = args.id as number;
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
