import { EventType } from "./../event";

export type ActionArgs = {
  [index: string]: string | number | boolean | null;
} & { eventName?: EventType };
