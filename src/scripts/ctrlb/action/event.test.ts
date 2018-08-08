import { EventActionGroup, EventActionInvoker } from "./event";
import { Storage } from "webextension-polyfill-ts";
import { EventType } from "./../event";

describe("EventActionGroup", () => {
  let set: jest.Mock;
  let actionGroup: EventActionGroup;

  beforeEach(() => {
    set = jest.fn();

    const StorageClass = jest.fn<Storage.SyncStorageArea>(() => ({
      set: set
    }));
    const eventStorage = new StorageClass();

    actionGroup = new EventActionGroup(eventStorage);
  });

  it("subscribe", () => {
    actionGroup.subscribe(EventType.tabUpdated);
    expect(set).toHaveBeenCalledWith({ [EventType.tabUpdated]: true });
  });

  it("unsubscribe", () => {
    actionGroup.unsubscribe(EventType.tabUpdated);
    expect(set).toHaveBeenCalledWith({ [EventType.tabUpdated]: false });
  });
});

describe("EventActionInvoker", () => {
  let subscribe: jest.Mock;
  let unsubscribe: jest.Mock;
  let invoker: EventActionInvoker;

  beforeEach(() => {
    subscribe = jest.fn();
    unsubscribe = jest.fn();

    const ActionGroupClass = jest.fn<EventActionGroup>(() => ({
      subscribe: subscribe,
      unsubscribe: unsubscribe
    }));
    const actionGroup = new ActionGroupClass();

    invoker = new EventActionInvoker(actionGroup);
  });

  it("subscribe", () => {
    invoker.subscribe({ eventName: EventType.tabUpdated });
    expect(subscribe).toHaveBeenCalledWith(EventType.tabUpdated);
  });

  it("unsubscribe", () => {
    invoker.unsubscribe({ eventName: EventType.tabUpdated });
    expect(unsubscribe).toHaveBeenCalledWith(EventType.tabUpdated);
  });
});
