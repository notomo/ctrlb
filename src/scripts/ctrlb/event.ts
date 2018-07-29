import { Client } from "./client";
import { Storage, Tabs } from "webextension-polyfill-ts";

export class SubscribeEventHandler {
  protected readonly handleFunctions: HandleFunctions;
  protected readonly events: Events;

  constructor(
    client: Client,
    protected readonly eventStorage: Storage.Static,
    protected readonly storage: Storage.SyncStorageArea,
    tabs: Tabs.Static
  ) {
    this.handleFunctions = new HandleFunctions(client);
    this.events = new Events(tabs);
  }

  public listen() {
    const initialValues: { [index: string]: boolean } = Object.keys(
      EventType
    ).reduce((eventNames: { [index: string]: boolean }, eventName: string) => {
      eventNames[eventName] = false;
      return eventNames;
    }, {});
    this.storage.set(initialValues);
    this.eventStorage.onChanged.addListener((changes: Storage.StorageChange) =>
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
  }
}

interface ListenerHolder {
  addListener(params: any): void;
  removeListener(params: any): void;
}

export enum EventType {
  tabActivated = "tabActivated",
  tabUpdated = "tabUpdated"
}

type IEvents = { [P in keyof IHandleFunctions]: ListenerHolder };

class Events implements IEvents {
  public readonly tabActivated: ListenerHolder;
  public readonly tabUpdated: ListenerHolder;

  constructor(tabs: Tabs.Static) {
    this.tabActivated = tabs.onActivated;
    this.tabUpdated = tabs.onUpdated;
  }
}
