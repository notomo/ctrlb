import { browser } from "webextension-polyfill-ts";
import { BookmarkActionGroup } from "./action/bookmark";
import { HistoryActionGroup } from "./action/history";
import { WindowActionGroup } from "./action/window";
import { NavigationActionGroup } from "./action/navigation";
import { DownloadActionGroup } from "./action/download";
import { TabActionGroup } from "./action/tab";
import { ScrollActionGroup } from "./action/scroll";
import { ZoomActionGroup } from "./action/zoom";
import { Router } from "./router";
import { Validator } from "./validator";
import { Config } from "./config";
import { SubscribeEventHandler } from "./event";
import { Client, Connector } from "./client";
import { Button } from "./browserAction";
import { RequestFactory } from "./request";
import { NotificationFactory } from "./notification";
import { ResponseFactory } from "./response";
import { MessageHandler } from "./handler";

interface Deps {
  BookmarkActionGroup: BookmarkActionGroup;
  HistoryActionGroup: HistoryActionGroup;
  WindowActionGroup: WindowActionGroup;
  NavigationActionGroup: NavigationActionGroup;
  DownloadActionGroup: DownloadActionGroup;
  TabActionGroup: TabActionGroup;
  ScrollActionGroup: ScrollActionGroup;
  ZoomActionGroup: ZoomActionGroup;
  Router: Router;
  Validator: Validator;
  Config: Config;
  SubscribeEventHandler: SubscribeEventHandler;
  Client: Client;
  MessageHandler: MessageHandler;
}

type DepsFuncs = { [P in keyof Deps]: { (...args: any[]): Deps[P] } };
type DepsCache = { [P in keyof Deps]: Deps[P] | null };
const initDepsCache = (depsFuncs: DepsFuncs): DepsCache => {
  const caches = {} as DepsCache;
  Object.keys(depsFuncs).map(key => {
    caches[key as keyof Deps] = null;
  });
  return caches;
};

export class Di {
  protected static readonly deps: DepsFuncs = {
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
    Config: () => {
      return new Config(browser.storage.local);
    },
    SubscribeEventHandler: (client: Client) => {
      return new SubscribeEventHandler(
        client,
        browser.tabs.onActivated,
        browser.tabs.onUpdated,
        browser.tabs.onCreated,
        browser.tabs.onRemoved,
        browser.tabs.onMoved,
        browser.tabs.onZoomChange,
        browser.history.onVisited,
        browser.history.onVisitRemoved,
        browser.windows.onFocusChanged,
        browser.windows.onCreated,
        browser.windows.onRemoved,
        browser.bookmarks.onCreated,
        browser.bookmarks.onRemoved,
        browser.bookmarks.onChanged,
        browser.downloads.onCreated
      );
    },
    Client: (messageHandler: MessageHandler) => {
      const connector = new Connector();
      const button = new Button(browser.browserAction);
      return new Client(connector, button, messageHandler);
    },
    MessageHandler: (router: Router) => {
      const requestFactory = new RequestFactory();
      const notificationFactory = new NotificationFactory();
      const responseFactory = new ResponseFactory();
      return new MessageHandler(
        router,
        requestFactory,
        notificationFactory,
        responseFactory
      );
    },
  };

  protected static readonly cache: DepsCache = initDepsCache(Di.deps);

  public static get<ClassName extends keyof Deps>(
    cls: ClassName,
    cacheable: boolean = true,
    ...args: any[]
  ): Deps[ClassName] {
    const cache = this.cache[cls];
    if (cache !== null) {
      return cache as Deps[ClassName];
    }
    const resolved = this.deps[cls](...args) as Deps[ClassName];
    if (cacheable) {
      this.cache[cls] = resolved;
    }
    return resolved;
  }

  public static set<ClassName extends keyof Deps>(
    cls: ClassName,
    value: Deps[ClassName]
  ): void {
    this.cache[cls] = value;
  }

  public static clear(): void {
    for (const key of Object.keys(this.deps)) {
      this.cache[key as keyof DepsCache] = null;
    }
  }
}
