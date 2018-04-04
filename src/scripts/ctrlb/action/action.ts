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
  (info: ActionInfo): Result;
}

export abstract class ActionKind {
  protected chrome: ChromePromise;
  constructor() {
    this.chrome = new ChromePromise();
  }

  public execute(actionInfo: ActionInfo): Result {
    const actionName = actionInfo.actionName;
    return this.getActions()[actionName](actionInfo);
  }
  protected abstract getActions(): ActionGroup;
}

// TODO
interface ActionArgs {
  [index: string]: string | number | boolean;
}

export interface ActionInfo {
  kindName: string;
  actionName: string;
  args?: ActionArgs;
}
