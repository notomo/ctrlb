import { EventActionGroup } from "./event";
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
