import { Action, ActionInvoker, ActionArgs } from "./action";
import { Storage } from "webextension-polyfill-ts";
import { EventType } from "./../event";

export class EventActionGroup {
  constructor(protected readonly eventStorage: Storage.SyncStorageArea) {}

  public subscribe(eventName: EventType): null {
    this.eventStorage.set({ [eventName]: true });
    return null;
  }

  public unsubscribe(eventName: EventType): null {
    this.eventStorage.set({ [eventName]: false });
    return null;
  }
}

export class EventActionInvoker extends ActionInvoker<EventActionGroup> {
  public readonly subscribe: Action;
  public readonly unsubscribe: Action;

  constructor(actionGroup: EventActionGroup) {
    super(actionGroup);

    this.subscribe = (args: ActionArgs) => {
      const a = this.v.has({ eventName: this.v.eventName() }, args);
      return actionGroup.subscribe(a.eventName);
    };

    this.unsubscribe = (args: ActionArgs) => {
      const a = this.v.has({ eventName: this.v.eventName() }, args);
      return actionGroup.unsubscribe(a.eventName);
    };
  }
}
