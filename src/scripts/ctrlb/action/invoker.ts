import { TabActionInvoker, TabActionGroup } from "./tab";
import { BookmarkActionInvoker, BookmarkActionGroup } from "./bookmark";
import { HistoryActionGroup, HistoryActionInvoker } from "./history";
import { WindowActionInvoker, WindowActionGroup } from "./window";
import { NavigationActionInvoker, NavigationActionGroup } from "./navigation";
import { ScrollActionInvoker, ScrollActionGroup } from "./scroll";
import { ZoomActionInvoker, ZoomActionGroup } from "./zoom";
import { Browser } from "webextension-polyfill-ts";
import { Validator } from "./validator";
import { ActionArgs, ResultInfo, Action } from "./action";

export class ActionInvokers {
  public readonly tab: TabActionInvoker;
  public readonly bookmark: BookmarkActionInvoker;
  public readonly history: HistoryActionInvoker;
  public readonly window: WindowActionInvoker;
  public readonly navigation: NavigationActionInvoker;
  public readonly scroll: ScrollActionInvoker;
  public readonly zoom: ZoomActionInvoker;

  constructor(browser: Browser) {
    this.tab = ((): TabActionInvoker => {
      const actionGroup = new TabActionGroup(browser.tabs);
      const validator = new Validator(actionGroup);
      return new TabActionInvoker(actionGroup, validator);
    })();

    this.bookmark = ((): BookmarkActionInvoker => {
      const tabActionGroup = new TabActionGroup(browser.tabs);
      const actionGroup = new BookmarkActionGroup(
        tabActionGroup,
        browser.bookmarks
      );
      const validator = new Validator(actionGroup);
      return new BookmarkActionInvoker(actionGroup, validator);
    })();

    this.history = ((): HistoryActionInvoker => {
      const actionGroup = new HistoryActionGroup(browser.history);
      const validator = new Validator(actionGroup);
      return new HistoryActionInvoker(actionGroup, validator);
    })();

    this.window = ((): WindowActionInvoker => {
      const actionGroup = new WindowActionGroup(browser.windows);
      const validator = new Validator(actionGroup);
      return new WindowActionInvoker(actionGroup, validator);
    })();

    this.navigation = ((): NavigationActionInvoker => {
      const actionGroup = new NavigationActionGroup(browser.tabs);
      const validator = new Validator(actionGroup);
      return new NavigationActionInvoker(actionGroup, validator);
    })();

    this.scroll = ((): ScrollActionInvoker => {
      const actionGroup = new ScrollActionGroup(browser.tabs);
      const validator = new Validator(actionGroup);
      return new ScrollActionInvoker(actionGroup, validator);
    })();

    this.zoom = ((): ZoomActionInvoker => {
      const actionGroup = new ZoomActionGroup(browser.tabs);
      const validator = new Validator(actionGroup);
      return new ZoomActionInvoker(actionGroup, validator);
    })();
  }
}

export class ActionFacade {
  protected readonly invokers: ActionInvokers;

  constructor(browser: Browser) {
    this.invokers = new ActionInvokers(browser);
  }

  protected getActionInvoker<T extends keyof ActionInvokers>(
    name: T
  ): ActionInvokers[T] {
    return this.invokers[name];
  }

  protected getAction<
    T extends ActionInvokers[keyof ActionInvokers],
    K extends keyof T
  >(invoker: T, actionName: K): T[K] {
    return invoker[actionName];
  }

  protected isActionName<T extends ActionInvokers[keyof ActionInvokers]>(
    invoker: T,
    actionName: string | number | symbol
  ): actionName is keyof T {
    return actionName in invoker;
  }

  protected isActionGroupName(
    actionGroupName: string | number | symbol
  ): actionGroupName is keyof ActionInvokers {
    return actionGroupName in this.invokers;
  }

  public async execute(json: any): Promise<ResultInfo> {
    const actionInfo = json as ActionInfo;

    if (!this.isActionGroupName(actionInfo.actionGroupName)) {
      throw new Error(actionInfo.actionGroupName + " is not actionGroup.");
    }
    const invoker = this.getActionInvoker(actionInfo.actionGroupName);

    if (!this.isActionName(invoker, actionInfo.actionName)) {
      throw new Error(
        actionInfo.actionName +
          " is not " +
          actionInfo.actionGroupName +
          "'s action."
      );
    }
    const action: Action = this.getAction(invoker, actionInfo.actionName);

    const result = await action(actionInfo.args);
    if (result === null) {
      return {};
    }
    return result;
  }
}

interface ActionInfo {
  actionGroupName: string;
  actionName: string;
  args: ActionArgs;
}
