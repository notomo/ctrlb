import { browser } from "webextension-polyfill-ts";
import { BookmarkActionGroup } from "./action/bookmark";
import { HistoryActionGroup } from "./action/history";
import { WindowActionGroup } from "./action/window";
import { NavigationActionGroup } from "./action/navigation";
import { EventActionGroup } from "./action/event";
import { ApiInfoActionGroup } from "./action/apiInfo";
import { DownloadActionGroup } from "./action/download";
import { TabActionGroup } from "./action/tab";
import { ScrollActionGroup } from "./action/scroll";
import { ZoomActionGroup } from "./action/zoom";
import { Router } from "./router";
import { Validator } from "./validator";

export class Di {
  protected static readonly deps: Deps = {
    BookmarkActionGroup: () => {
      const tab = Di.get("TabActionGroup");
      return new BookmarkActionGroup(tab, browser.bookmarks);
    },
    HistoryActionGroup: () => {
      return new HistoryActionGroup(browser.history);
    },
    WindowActionGroup: () => {
      return new WindowActionGroup(browser.windows);
    },
    NavigationActionGroup: () => {
      return new NavigationActionGroup(browser.tabs);
    },
    EventActionGroup: () => {
      return new EventActionGroup(browser.storage.local);
    },
    ApiInfoActionGroup: () => {
      const actionGroups = {
        tab: Di.get("TabActionGroup"),
        bookmark: Di.get("BookmarkActionGroup"),
        history: Di.get("HistoryActionGroup"),
        window: Di.get("WindowActionGroup"),
        navigation: Di.get("NavigationActionGroup"),
        scroll: Di.get("ScrollActionGroup"),
        zoom: Di.get("ZoomActionGroup"),
        event: Di.get("EventActionGroup"),
        download: Di.get("DownloadActionGroup"),
      };
      return new ApiInfoActionGroup(actionGroups);
    },
    DownloadActionGroup: () => {
      return new DownloadActionGroup(browser.downloads);
    },
    TabActionGroup: () => {
      return new TabActionGroup(browser.tabs);
    },
    ScrollActionGroup: () => {
      return new ScrollActionGroup(browser.tabs);
    },
    ZoomActionGroup: () => {
      return new ZoomActionGroup(browser.tabs);
    },
    Router: () => {
      const validator = Di.get("Validator");
      return new Router(validator);
    },
    Validator: () => {
      return new Validator();
    },
  };

  protected static readonly cache: DepsCache = {
    BookmarkActionGroup: null,
    HistoryActionGroup: null,
    WindowActionGroup: null,
    NavigationActionGroup: null,
    EventActionGroup: null,
    ApiInfoActionGroup: null,
    DownloadActionGroup: null,
    TabActionGroup: null,
    ScrollActionGroup: null,
    ZoomActionGroup: null,
    Router: null,
    Validator: null,
  };

  public static get(cls: "BookmarkActionGroup"): BookmarkActionGroup;
  public static get(cls: "HistoryActionGroup"): HistoryActionGroup;
  public static get(cls: "WindowActionGroup"): WindowActionGroup;
  public static get(cls: "NavigationActionGroup"): NavigationActionGroup;
  public static get(cls: "EventActionGroup"): EventActionGroup;
  public static get(cls: "ApiInfoActionGroup"): ApiInfoActionGroup;
  public static get(cls: "DownloadActionGroup"): DownloadActionGroup;
  public static get(cls: "TabActionGroup"): TabActionGroup;
  public static get(cls: "ScrollActionGroup"): ScrollActionGroup;
  public static get(cls: "ZoomActionGroup"): ZoomActionGroup;
  public static get(cls: "Router"): Router;
  public static get(cls: "Validator"): Validator;
  public static get(
    cls: keyof Deps,
    cacheable: boolean = true,
    ...args: any[]
  ): ReturnType<Deps[keyof Deps]> {
    const cache = this.cache[cls];
    if (cache !== null) {
      return cache;
    }
    const resolved = this.deps[cls](...args);
    if (cacheable) {
      this.cache[cls] = resolved;
    }
    return resolved;
  }

  public static set(
    cls: keyof Deps,
    value: ReturnType<Deps[keyof Deps]>
  ): void {
    this.cache[cls] = value;
  }

  public static clear(): void {
    for (const key of Object.keys(this.deps)) {
      this.cache[key as keyof DepsCache] = null;
    }
  }
}

interface Deps {
  BookmarkActionGroup: { (...args: any[]): BookmarkActionGroup };
  HistoryActionGroup: { (...args: any[]): HistoryActionGroup };
  WindowActionGroup: { (...args: any[]): WindowActionGroup };
  NavigationActionGroup: { (...args: any[]): NavigationActionGroup };
  EventActionGroup: { (...args: any[]): EventActionGroup };
  ApiInfoActionGroup: { (...args: any[]): ApiInfoActionGroup };
  DownloadActionGroup: { (...args: any[]): DownloadActionGroup };
  TabActionGroup: { (...args: any[]): TabActionGroup };
  ScrollActionGroup: { (...args: any[]): ScrollActionGroup };
  ZoomActionGroup: { (...args: any[]): ZoomActionGroup };
  Router: { (...args: any[]): Router };
  Validator: { (...args: any[]): Validator };
}

type DepsCache = { [P in keyof Deps]: ReturnType<Deps[P]> | null };
