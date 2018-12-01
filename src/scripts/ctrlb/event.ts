import { Client } from "./client";
import {
  Storage,
  Tabs,
  History,
  Windows,
  Bookmarks,
  Downloads,
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
    tabMoved: ListenerHolder,
    zoomChanged: ListenerHolder,
    historyCreated: ListenerHolder,
    historyRemoved: ListenerHolder,
    historyUpdated: ListenerHolder,
    windowActivated: ListenerHolder,
    windowCreated: ListenerHolder,
    windowRemoved: ListenerHolder,
    bookmarkCreated: ListenerHolder,
    bookmarkRemoved: ListenerHolder,
    bookmarkUpdated: ListenerHolder,
    downloadCreated: ListenerHolder
  ) {
    this.handleFunctions = new HandleFunctions(client);
    this.events = {
      tabActivated: tabActivated,
      tabUpdated: tabUpdated,
      tabCreated: tabCreated,
      tabRemoved: tabRemoved,
      tabMoved: tabMoved,
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
      downloadCreated: downloadCreated,
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

  public readonly tabMoved: {
    (tabId: number, moveInfo: Tabs.OnMovedMoveInfoType): void;
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

  public readonly downloadCreated: {
    (download: Downloads.DownloadItem): void;
  };

  constructor(client: Client) {
    this.tabActivated = (info: Tabs.OnActivatedActiveInfoType): void => {
      client.notifyWithData(info, EventType.tabActivated);
    };

    this.tabUpdated = (
      tabId: number,
      info: Tabs.OnUpdatedChangeInfoType
    ): void => {
      client.notifyWithData({ id: tabId, info: info }, EventType.tabUpdated);
    };

    this.tabCreated = (tab: Tabs.Tab): void => {
      client.notifyWithData(tab, EventType.tabCreated);
    };

    this.tabRemoved = (
      tabId: number,
      removeInfo: Tabs.OnRemovedRemoveInfoType
    ): void => {
      client.notifyWithData(removeInfo, EventType.tabRemoved);
    };

    this.tabMoved = (
      tabId: number,
      moveInfo: Tabs.OnMovedMoveInfoType
    ): void => {
      client.notifyWithData(moveInfo, EventType.tabMoved);
    };

    this.zoomChanged = (
      zoomChangeInfo: Tabs.OnZoomChangeZoomChangeInfoType
    ): void => {
      client.notifyWithData(zoomChangeInfo, EventType.zoomChanged);
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
      client.notifyWithData(windowId, EventType.windowActivated);
    };

    this.windowCreated = (window: Windows.Window): void => {
      client.notifyWithData(window, EventType.windowCreated);
    };

    this.windowRemoved = (windowId: number): void => {
      client.notifyWithData(windowId, EventType.windowRemoved);
    };

    this.bookmarkCreated = (
      bookmarkId: string,
      bookmark: Bookmarks.BookmarkTreeNode
    ): void => {
      client.notifyWithData(bookmark, EventType.bookmarkCreated);
    };

    this.bookmarkRemoved = (
      bookmarkId: string,
      removeInfo: Bookmarks.OnRemovedRemoveInfoType
    ): void => {
      client.notifyWithData(
        { id: bookmarkId, info: removeInfo },
        EventType.bookmarkRemoved
      );
    };

    this.bookmarkUpdated = (
      bookmarkId: string,
      changeInfo: Bookmarks.OnChangedChangeInfoType
    ): void => {
      client.notifyWithData(
        { id: bookmarkId, info: changeInfo },
        EventType.bookmarkUpdated
      );
    };

    this.downloadCreated = (download: Downloads.DownloadItem): void => {
      client.notifyWithData(download, EventType.downloadCreated);
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
  tabMoved = "tabMoved",
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
  downloadCreated = "downloadCreated",
}

type Events = { [P in keyof IHandleFunctions]: ListenerHolder };
