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
      moveLast: (args: ActionArgs) => this.moveLast(args)
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

  protected async create(args: ActionArgs): Promise<ResultInfo> {
    return this.chrome.tabs.create({}).then((tab: chrome.tabs.Tab) => {
      return { status: "ok" };
    });
  }

  protected async first(args: ActionArgs): Promise<ResultInfo> {
    return this.chrome.tabs
      .query({ currentWindow: true, index: 0 })
      .then((tabs: chrome.tabs.Tab[]) => {
        const tab = tabs.pop();
        if (tab !== undefined) {
          this.update(tab, { active: true });
        }
        return { status: "ok" };
      });
  }

  protected async next(args: ActionArgs): Promise<ResultInfo> {
    return this.getCurrentTab()
      .then((tab: chrome.tabs.Tab) => {
        const index = tab.index as number;
        return this.chrome.tabs.query({
          currentWindow: true,
          index: index + 1
        });
      })
      .then((tabs: chrome.tabs.Tab[]) => {
        const tab = tabs.pop();
        if (tab !== undefined) {
          this.update(tab, { active: true });
        }
        return { status: "ok" };
      });
  }

  protected async previous(args: ActionArgs): Promise<ResultInfo> {
    return this.getCurrentTab()
      .then((tab: chrome.tabs.Tab) => {
        const index = tab.index as number;
        if (index === 0) {
          return [];
        }
        return this.chrome.tabs.query({
          currentWindow: true,
          index: index - 1
        });
      })
      .then((tabs: chrome.tabs.Tab[]) => {
        const tab = tabs.pop();
        if (tab !== undefined) {
          this.update(tab, { active: true });
        }
        return { status: "ok" };
      });
  }

  protected async last(args: ActionArgs): Promise<ResultInfo> {
    return await this.chrome.tabs
      .query({ currentWindow: true })
      .then((tabs: chrome.tabs.Tab[]) => {
        const indexes = tabs.map((tab: chrome.tabs.Tab) => {
          return tab.index;
        });
        indexes.push(-1);
        const index = Math.max.apply(null, indexes);
        if (index === -1) {
          return [];
        }
        return this.chrome.tabs.query({ index: index });
      })
      .then((tabs: chrome.tabs.Tab[]) => {
        const tab = tabs.pop();
        if (tab !== undefined) {
          this.update(tab, { active: true });
        }
        return { status: "ok" };
      });
  }

  protected moveLeft(args: ActionArgs): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: chrome.tabs.Tab) => {
      if (tab.index > 0) {
        const id = tab.id as number;
        this.chrome.tabs.move(id, { index: tab.index - 1 });
      }
      return { status: "ok" };
    });
  }

  protected moveRight(args: ActionArgs): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: chrome.tabs.Tab) => {
      const id = tab.id as number;
      this.chrome.tabs.move(id, { index: tab.index + 1 });
      return { status: "ok" };
    });
  }

  protected moveFirst(args: ActionArgs): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: chrome.tabs.Tab) => {
      const id = tab.id as number;
      this.chrome.tabs.move(id, { index: 0 });
      return { status: "ok" };
    });
  }

  protected moveLast(args: ActionArgs): Promise<ResultInfo> {
    return this.getCurrentTab().then((tab: chrome.tabs.Tab) => {
      const id = tab.id as number;
      this.chrome.tabs.move(id, { index: -1 });
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

  protected closeOthers(args: ActionArgs): Promise<ResultInfo> {
    return this.getCurrentTab()
      .then(async (tab: chrome.tabs.Tab) => {
        const tabId = tab.id as number;
        const tabs = await this.chrome.tabs.query({
          currentWindow: true,
          pinned: false
        });
        return tabs.filter((tab: chrome.tabs.Tab) => {
          return tab.id !== tabId;
        });
      })
      .then((tabs: chrome.tabs.Tab[]) => {
        const tabIds = tabs.map((tab: chrome.tabs.Tab) => {
          return tab.id as number;
        });
        this.chrome.tabs.remove(tabIds);
        return { status: "ok" };
      });
  }

  protected closeRight(args: ActionArgs): Promise<ResultInfo> {
    return this.getCurrentTab()
      .then(async (tab: chrome.tabs.Tab) => {
        const index = tab.index as number;
        const tabs = await this.chrome.tabs.query({
          currentWindow: true,
          pinned: false
        });
        return tabs.filter((tab: chrome.tabs.Tab) => {
          return tab.index > index;
        });
      })
      .then((tabs: chrome.tabs.Tab[]) => {
        const tabIds = tabs.map((tab: chrome.tabs.Tab) => {
          return tab.id as number;
        });
        this.chrome.tabs.remove(tabIds);
        return { status: "ok" };
      });
  }

  protected closeLeft(args: ActionArgs): Promise<ResultInfo> {
    return this.getCurrentTab()
      .then(async (tab: chrome.tabs.Tab) => {
        const index = tab.index as number;
        const tabs = await this.chrome.tabs.query({
          currentWindow: true,
          pinned: false
        });
        return tabs.filter((tab: chrome.tabs.Tab) => {
          return tab.index < index;
        });
      })
      .then((tabs: chrome.tabs.Tab[]) => {
        const tabIds = tabs.map((tab: chrome.tabs.Tab) => {
          return tab.id as number;
        });
        this.chrome.tabs.remove(tabIds);
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
