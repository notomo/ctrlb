import { Browser } from "./facade";

export interface ActionGroup {
  [index: string]: Action | NoArgsAction;
}

export interface ResultInfo {
  body?: any;
}

export type Result = ResultInfo | Promise<ResultInfo> | null | Promise<null>;

interface ActionMethod {
  (args: ActionArgs): Result;
}

interface Action {
  f: ActionMethod;
}

interface NoArgsAction {
  (): Result;
  f?: ActionMethod;
}

export abstract class ActionKind {
  protected browser: Browser;

  protected readonly requiredNumber = 1;
  protected readonly optionalNumber = 2;
  protected readonly requiredString = "required";
  protected readonly optionalString = "optional";
  protected readonly requiredBoolean = true;
  protected readonly optionalBoolean = false;

  protected readonly requireds = [
    this.requiredNumber,
    this.requiredString,
    this.requiredBoolean
  ];

  protected readonly optionals = [
    this.optionalNumber,
    this.optionalString,
    this.optionalBoolean
  ];

  constructor(browser: Browser) {
    this.browser = browser;
  }

  public execute(actionName: string, args: ActionArgs): Result {
    const action = this.getActions()[actionName];
    if (this.isNoArgsAction(action)) {
      return action();
    }
    return action.f(args);
  }

  protected abstract getActions(): ActionGroup;

  protected isNoArgsAction(
    action: Action | NoArgsAction
  ): action is NoArgsAction {
    return action.f === undefined;
  }

  protected hasId(args: ActionArgs): number {
    return this.has({ id: this.requiredNumber }, args).id;
  }

  protected has<T extends ActionArgs>(valid: T, args: ActionArgs): T {
    let results = {} as T;
    for (const key of Object.keys(valid)) {
      const validationValue = valid[key];
      if (validationValue === null) {
        throw new Error("validationValue must not be null.");
      }

      if (!(key in args) && this.requireds.indexOf(validationValue) > -1) {
        throw new Error(key + " is a required argument.");
      }

      if (!(key in args) && this.optionals.indexOf(validationValue) > -1) {
        results[key] = null;
        continue;
      }

      const value = args[key];
      if (value === null || value === undefined) {
        if (this.optionals.indexOf(validationValue) > -1) {
          results[key] = null;
          continue;
        }
        throw new Error(key + " must not be void.");
      }

      if (typeof validationValue !== typeof value) {
        throw new Error(
          key + "'s value must be " + typeof validationValue + " type."
        );
      }

      results[key] = value;
    }
    return results;
  }
}

// TODO
export interface ActionArgs {
  [index: string]: string | number | boolean | null;
}

export interface ActionInfo {
  kindName: string;
  actionName: string;
  args: ActionArgs;
}
