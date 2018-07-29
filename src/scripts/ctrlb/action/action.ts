import { Validator } from "./validator";
import { EventType } from "./../event";

export type ActionResult = any;

export interface NoArgsAction {
  (): ActionResult;
}

export interface IdArgsAction {
  (id: number): ActionResult;
}

// TODO
export type ActionArgs = {
  [index: string]: string | number | boolean | null;
} & { eventName?: EventType };

export interface Action {
  (args: ActionArgs): ActionResult;
}

type NoArgsActions<T> = { [index: string]: NoArgsAction } & {
  [index: string]: T[keyof T];
};

type IdArgsActions<T> = { [index: string]: IdArgsAction } & {
  [index: string]: T[keyof T];
};

export class ActionInvoker<T> {
  protected readonly v: Validator<T>;

  constructor(protected readonly actionGroup: T) {
    this.v = new Validator(actionGroup);
  }

  protected noArgsAction<K extends NoArgsActions<T>>(
    noArgsActions: K,
    actionName: keyof T & keyof K & string
  ) {
    return this.v.noArgs(noArgsActions, actionName);
  }

  protected idArgsAction<K extends IdArgsActions<T>>(
    idArgsActions: K,
    actionName: keyof T & keyof K & string
  ) {
    return this.v.idArgs(idArgsActions, actionName);
  }
}

// TODO send api info
