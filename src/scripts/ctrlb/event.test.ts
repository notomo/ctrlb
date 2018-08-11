import { Client } from "./client";
import { SubscribeEventHandler } from "./event";
import { Storage } from "webextension-polyfill-ts";

describe("SubscribeEventHandler", () => {
  it("listen", async () => {
    const ClientClass = jest.fn<Client>(() => ({}));
    const client = new ClientClass();

    const addListener = jest.fn(cb => {
      cb({ tabActivated: { newValue: true, oldValue: false } });
      cb({ tabActivated: { newValue: false, oldValue: true } });
    });
    const onEventEmitted = {
      addListener: addListener,
    };

    const StorageClass = jest.fn<Storage.SyncStorageArea>(() => ({
      set: jest.fn(),
    }));
    const storage = new StorageClass();

    const onActivated = {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    };

    new SubscribeEventHandler(
      client,
      onEventEmitted,
      storage,
      onActivated,
      onActivated,
      onActivated,
      onActivated,
      onActivated,
      onActivated,
      onActivated,
      onActivated,
      onActivated,
      onActivated,
      onActivated,
      onActivated,
      onActivated,
      onActivated
    ).listen();
  });
});
