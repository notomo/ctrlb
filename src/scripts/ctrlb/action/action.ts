import ChromePromise from "chrome-promise";

export interface ActionGroup {
  [index: string]: Action;
}

export interface ResultInfo {
  // TODO: enum
  status: string;
  body?: any;
}

export type Result = ResultInfo | Promise<ResultInfo>;

interface Action {
  (args: ActionArgs): Result;
}

export abstract class ActionKind {
  protected chrome: ChromePromise;
  constructor() {
    this.chrome = new ChromePromise();
  }

  public execute(actionName: string, args: ActionArgs): Result {
    return this.getActions()[actionName](args);
  }
  protected abstract getActions(): ActionGroup;
}

// TODO
export interface ActionArgs {
  [index: string]: string | number | boolean;
}

export interface ActionInfo {
  kindName: string;
  actionName: string;
  args: ActionArgs;
}
