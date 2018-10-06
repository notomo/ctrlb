import { Client } from "./client";
import {
  Storage,
  Tabs,
  History,
  Windows,
  Bookmarks,
} from "webextension-polyfill-ts";

export class SubscribeEventHandler {
  protected readonly handleFunctions: HandleFunctions;
  protected readonly events: Events;

  constructor(
    client: Client,
    protected readonly onEventEmitted: { addListener(params: any): void },
    protected readonly storage: Storage.LocalStorageArea,
    tabActivated: ListenerHolder,
    tabUpdated: ListenerHolder,
    tabCreated: ListenerHolder,
    tabRemoved: ListenerHolder,
    zoomChanged: ListenerHolder,
    historyCreated: ListenerHolder,
    historyRemoved: ListenerHolder,
    historyUpdated: ListenerHolder,
    windowActivated: ListenerHolder,
    windowCreated: ListenerHolder,
    windowRemoved: ListenerHolder,
    bookmarkCreated: ListenerHolder,
    bookmarkRemoved: ListenerHolder,
    bookmarkUpdated: ListenerHolder
  ) {
    this.handleFunctions = new HandleFunctions(client);
    this.events = {
      tabActivated: tabActivated,
      tabUpdated: tabUpdated,
      tabCreated: tabCreated,
      tabRemoved: tabRemoved,
      zoomChanged: zoomChanged,
      historyCreated: historyCreated,
      historyRemoved: historyRemoved,
      historyUpdated: historyUpdated,
      windowActivated: windowActivated,
      windowCreated: windowCreated,
      windowRemoved: windowRemoved,
      bookmarkCreated: bookmarkCreated,
      bookmarkRemoved: bookmarkRemoved,
      bookmarkUpdated: bookmarkUpdated,
    };
  }

  public listen() {
    const initialValues: { [index: string]: boolean } = Object.keys(
      EventType
    ).reduce((eventNames: { [index: string]: boolean }, eventName: string) => {
      eventNames[eventName] = false;
      return eventNames;
    }, {});
    this.storage.set(initialValues);
    this.onEventEmitted.addListener((changes: Storage.StorageChange) =>
      this.onChanged(changes)
    );
  }

  protected isEventName(name: string): name is EventType {
    return name in EventType;
  }

  protected updateListener(eventName: string, isSubscription: boolean) {
    if (!this.isEventName(eventName)) {
      throw new Error(eventName + " is not valid EventType.");
    }
    const handleFunction = this.handleFunctions[eventName];
    const event = this.events[eventName];
    if (isSubscription) {
      event.addListener(handleFunction);
    } else {
      event.removeListener(handleFunction);
    }
  }

  protected onChanged(changes: Storage.StorageChange) {
    Object.entries(changes).forEach(([key, values]) => {
      this.updateListener(key, values.newValue);
    });
  }
}

type IHandleFunctions = { [P in EventType]: { (...params: any[]): void } };

class HandleFunctions implements IHandleFunctions {
  public readonly tabActivated: {
    (info: Tabs.OnActivatedActiveInfoType): void;
  };
  public readonly tabUpdated: {
    (tabId: number, info: Tabs.OnUpdatedChangeInfoType): void;
  };

  public readonly tabCreated: {
    (tab: Tabs.Tab): void;
  };

  public readonly tabRemoved: {
    (tabId: number, removeInfo: Tabs.OnRemovedRemoveInfoType): void;
  };

  public readonly zoomChanged: {
    (zoomChangeInfo: Tabs.OnZoomChangeZoomChangeInfoType): void;
  };

  public readonly historyCreated: {
    (history: History.HistoryItem): void;
  };

  public readonly historyRemoved: {
    (removeInfo: History.OnVisitRemovedRemovedType): void;
  };

  public readonly historyUpdated: {
    (changeInfo: History.OnTitleChangedChangedType): void;
  };

  public readonly windowActivated: {
    (windowId: number): void;
  };

  public readonly windowCreated: {
    (window: Windows.Window): void;
  };

  public readonly windowRemoved: {
    (windowId: number): void;
  };

  public readonly bookmarkCreated: {
    (bookmarkId: string, bookmark: Bookmarks.BookmarkTreeNode): void;
  };

  public readonly bookmarkRemoved: {
    (bookmarkId: string, removeInfo: Bookmarks.OnRemovedRemoveInfoType): void;
  };

  public readonly bookmarkUpdated: {
    (bookmarkId: string, changeInfo: Bookmarks.OnChangedChangeInfoType): void;
  };

  constructor(client: Client) {
    this.tabActivated = (info: Tabs.OnActivatedActiveInfoType): void => {
      client.notify("tab", "get", EventType.tabActivated, { id: info.tabId });
    };

    this.tabUpdated = (
      tabId: number,
      info: Tabs.OnUpdatedChangeInfoType
    ): void => {
      client.notify("tab", "get", EventType.tabUpdated, { id: tabId });
    };

    this.tabCreated = (tab: Tabs.Tab): void => {
      if (tab.id === undefined) {
        return;
      }
      client.notify("tab", "get", EventType.tabCreated, { id: tab.id });
    };

    this.tabRemoved = (
      tabId: number,
      removeInfo: Tabs.OnRemovedRemoveInfoType
    ): void => {
      client.notify("tab", "get", EventType.tabRemoved, { id: tabId });
    };

    this.zoomChanged = (
      zoomChangeInfo: Tabs.OnZoomChangeZoomChangeInfoType
    ): void => {
      client.notify("zoom", "get", EventType.zoomChanged);
    };

    this.historyCreated = (history: History.HistoryItem): void => {
      client.notifyWithData(history, EventType.historyCreated);
    };

    this.historyRemoved = (
      removeInfo: History.OnVisitRemovedRemovedType
    ): void => {
      client.notifyWithData(removeInfo, EventType.historyRemoved);
    };

    this.historyUpdated = (
      changeInfo: History.OnTitleChangedChangedType
    ): void => {
      client.notifyWithData(changeInfo, EventType.historyUpdated);
    };

    this.windowActivated = (windowId: number): void => {
      client.notify("window", "get", EventType.windowActivated, {
        id: windowId,
      });
    };

    this.windowCreated = (window: Windows.Window): void => {
      if (window.id === undefined) {
        return;
      }
      client.notify("window", "get", EventType.windowCreated, {
        id: window.id,
      });
    };

    this.windowRemoved = (windowId: number): void => {
      client.notify("window", "get", EventType.windowRemoved, {
        id: windowId,
      });
    };

    this.bookmarkCreated = (
      bookmarkId: string,
      bookmark: Bookmarks.BookmarkTreeNode
    ): void => {
      client.notify("bookmark", "get", EventType.bookmarkCreated, {
        id: bookmarkId,
      });
    };

    this.bookmarkRemoved = (
      bookmarkId: string,
      removeInfo: Bookmarks.OnRemovedRemoveInfoType
    ): void => {
      client.notify("bookmark", "get", EventType.bookmarkRemoved, {
        id: bookmarkId,
      });
    };

    this.bookmarkUpdated = (
      bookmarkId: string,
      changeInfo: Bookmarks.OnChangedChangeInfoType
    ): void => {
      client.notify("bookmark", "get", EventType.bookmarkUpdated, {
        id: bookmarkId,
      });
    };
  }
}

interface ListenerHolder {
  addListener(params: any): void;
  removeListener(params: any): void;
}

export enum EventType {
  tabActivated = "tabActivated",
  tabUpdated = "tabUpdated",
  tabCreated = "tabCreated",
  tabRemoved = "tabRemoved",
  zoomChanged = "zoomChanged",
  historyCreated = "historyCreated",
  historyRemoved = "historyRemoved",
  historyUpdated = "historyUpdated",
  windowActivated = "windowActivated",
  windowCreated = "windowCreated",
  windowRemoved = "windowRemoved",
  bookmarkCreated = "bookmarkCreated",
  bookmarkRemoved = "bookmarkRemoved",
  bookmarkUpdated = "bookmarkUpdated",
}

type Events = { [P in keyof IHandleFunctions]: ListenerHolder };
