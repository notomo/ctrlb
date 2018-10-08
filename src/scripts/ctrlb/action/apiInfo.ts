import { Action, ActionInvoker } from "./action";

export interface ApiInfo {
  actionGroups: {
    name: string;
    actions: {
      name: string;
    }[];
  }[];
}

export class ApiInfoActionGroup {
  constructor(
    protected readonly invokers: {
      [index: string]: Object;
    }
  ) {}

  public async get(): Promise<ApiInfo> {
    const invokers = this.invokers;
    invokers["apiInfo"] = { get: {} };

    const baseActionInvoker = new ActionInvoker<{}>({});

    const actionGroups = Object.keys(this.invokers).map(invokerName => {
      const invoker = this.invokers[invokerName];
      return {
        name: invokerName,
        actions: Object.entries(invoker)
          .filter(action => {
            return !(action[0] in baseActionInvoker);
          })
          .map(action => {
            return {
              name: action[0],
            };
          }),
      };
    });

    return {
      actionGroups: actionGroups,
    };
  }
}

export class ApiInfoActionInvoker extends ActionInvoker<ApiInfoActionGroup> {
  public readonly get: Action;

  constructor(actionGroup: ApiInfoActionGroup) {
    super(actionGroup);

    const noArgsActions = {
      get: actionGroup.get,
    };

    this.get = this.noArgsAction(noArgsActions, "get");
  }
}
