import { Validator } from "./validator";

export interface ResultInfo {
  body?: any;
}

export type Result =
  | ResultInfo
  | Promise<ResultInfo>
  | Promise<ResultInfo | null>
  | null
  | Promise<null>;

export interface NoArgsAction {
  (): Result;
}

export interface IdArgsAction {
  (id: number): Result;
}

// TODO
export interface ActionArgs {
  [index: string]: string | number | boolean | null;
}

export interface Action {
  (args: ActionArgs): Result;
}

type NoArgsActions<T> = { [index: string]: NoArgsAction } & {
  [index: string]: T[keyof T];
};

type IdArgsActions<T> = { [index: string]: IdArgsAction } & {
  [index: string]: T[keyof T];
};

export class ActionInvoker<T> {
  constructor(
    protected readonly actionGroup: T,
    protected readonly v: Validator<T>
  ) {}

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
