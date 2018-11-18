import { Storage } from "webextension-polyfill-ts";
import { EventType } from "./../event";

export class EventActionGroup {
  constructor(protected readonly eventStorage: Storage.LocalStorageArea) {}

  public subscribe(eventName: EventType): null {
    this.eventStorage.set({ [eventName]: true });
    return null;
  }

  public unsubscribe(eventName: EventType): null {
    this.eventStorage.set({ [eventName]: false });
    return null;
  }
}
