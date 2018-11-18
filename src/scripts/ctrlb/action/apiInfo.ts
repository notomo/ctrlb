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

    const actionGroups = Object.keys(this.invokers).map(invokerName => {
      const invoker = this.invokers[invokerName];
      return {
        name: invokerName,
        actions: Object.entries(invoker).map(action => {
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
