import { TabActionInvoker, TabActionGroup } from "./tab";
import { BookmarkActionInvoker, BookmarkActionGroup } from "./bookmark";
import { HistoryActionGroup, HistoryActionInvoker } from "./history";
import { WindowActionInvoker, WindowActionGroup } from "./window";
import { NavigationActionInvoker, NavigationActionGroup } from "./navigation";
import { ScrollActionInvoker, ScrollActionGroup } from "./scroll";
import { ZoomActionInvoker, ZoomActionGroup } from "./zoom";
import { EventActionInvoker, EventActionGroup } from "./event";
import { ApiInfoActionInvoker, ApiInfoActionGroup } from "./apiInfo";
import { Browser } from "webextension-polyfill-ts";
import { Action, ActionArgs } from "./action";

export class ActionInvokers {
  public readonly tab: TabActionInvoker;
  public readonly bookmark: BookmarkActionInvoker;
  public readonly history: HistoryActionInvoker;
  public readonly window: WindowActionInvoker;
  public readonly navigation: NavigationActionInvoker;
  public readonly scroll: ScrollActionInvoker;
  public readonly zoom: ZoomActionInvoker;
  public readonly event: EventActionInvoker;
  public readonly apiInfo: ApiInfoActionInvoker;

  constructor(browser: Browser) {
    this.tab = ((): TabActionInvoker => {
      const actionGroup = new TabActionGroup(browser.tabs);
      return new TabActionInvoker(actionGroup);
    })();

    this.bookmark = ((): BookmarkActionInvoker => {
      const tabActionGroup = new TabActionGroup(browser.tabs);
      const actionGroup = new BookmarkActionGroup(
        tabActionGroup,
        browser.bookmarks
      );
      return new BookmarkActionInvoker(actionGroup);
    })();

    this.history = ((): HistoryActionInvoker => {
      const actionGroup = new HistoryActionGroup(browser.history);
      return new HistoryActionInvoker(actionGroup);
    })();

    this.window = ((): WindowActionInvoker => {
      const actionGroup = new WindowActionGroup(browser.windows);
      return new WindowActionInvoker(actionGroup);
    })();

    this.navigation = ((): NavigationActionInvoker => {
      const actionGroup = new NavigationActionGroup(browser.tabs);
      return new NavigationActionInvoker(actionGroup);
    })();

    this.scroll = ((): ScrollActionInvoker => {
      const actionGroup = new ScrollActionGroup(browser.tabs);
      return new ScrollActionInvoker(actionGroup);
    })();

    this.zoom = ((): ZoomActionInvoker => {
      const actionGroup = new ZoomActionGroup(browser.tabs);
      return new ZoomActionInvoker(actionGroup);
    })();

    this.event = ((): EventActionInvoker => {
      const actionGroup = new EventActionGroup(browser.storage.local);
      return new EventActionInvoker(actionGroup);
    })();

    this.apiInfo = ((): ApiInfoActionInvoker => {
      const actionGroup = new ApiInfoActionGroup({
        tab: this.tab,
        bookmark: this.bookmark,
        history: this.history,
        window: this.window,
        navigation: this.navigation,
        scroll: this.scroll,
        zoom: this.zoom,
        event: this.event,
      });
      return new ApiInfoActionInvoker(actionGroup);
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
  ): actionName is keyof ActionInvokers[keyof ActionInvokers] {
    return actionName in invoker;
  }

  protected isActionGroupName(
    actionGroupName: string | number | symbol
  ): actionGroupName is keyof ActionInvokers {
    return actionGroupName in this.invokers;
  }

  public async execute(
    actionGroupName: string,
    actionName: string,
    args?: ActionArgs
  ): Promise<{}> {
    if (!this.isActionGroupName(actionGroupName)) {
      throw new Error(actionGroupName + " is not actionGroup.");
    }
    const invoker = this.getActionInvoker(actionGroupName);

    if (!this.isActionName(invoker, actionName)) {
      throw new Error(actionName + " is not " + actionGroupName + "'s action.");
    }
    const action: Action = this.getAction(invoker, actionName);

    const result = await action(args || {});
    return result || {};
  }
}
