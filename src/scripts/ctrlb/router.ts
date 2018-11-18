import { IRequest } from "./request";
import { Validator } from "./validator";
import { Tuple } from "./tuple";

export class Router {
  protected readonly routes: Map<string, { (request: IRequest): any }>;

  constructor(protected readonly validator: Validator) {
    this.routes = new Map<string, { (request: IRequest): any }>();
  }

  public add<T extends Tuple, K extends any>(
    name: string,
    bindTo: object,
    method: { (...args: T): K },
    types: T,
    names: { [P in keyof T]: string }
  ): { (request: IRequest): K } {
    const routeAction = (request: IRequest) => {
      const f = method.bind(bindTo);
      const params = this.validator.to(request.params, types, names);
      return f(...params);
    };
    this.routes.set(name, routeAction);
    return routeAction;
  }

  public match(request: IRequest) {
    const matched = this.routes.get(request.method);
    if (matched === undefined) {
      // TODO: throw no method error
      return;
    }

    return matched(request);
  }

  public getAll(): ({ name: string })[] {
    const results = [];
    const names = this.routes.keys();
    for (const name of names) {
      results.push({ name: name });
    }

    return results;
  }
}
