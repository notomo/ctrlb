import { IRequest } from "./request";
import { Validator } from "./validator";
import { Tuple } from "./tuple";
import { MethodNotFound } from "./error";

interface Route {
  name: string;
  action: { (request: IRequest): any };
  params: { name: string }[];
}

export class Router {
  protected readonly routes: Map<string, Route>;

  constructor(protected readonly validator: Validator) {
    this.routes = new Map<string, Route>();
  }

  public add<T extends Tuple, K extends any>(
    name: string,
    bindTo: object,
    method: { (...args: T): K },
    types: T,
    names: { [P in keyof T]: string }
  ): { (request: IRequest): K } {
    const routeAction = (request: IRequest) => {
      // FIXME: remove `as any`
      const f = method.bind(bindTo as any);
      const params = this.validator.to(request.params, types, names);
      return f(...params);
    };

    const params = [];
    for (const key in names) {
      const param = { name: names[key] };
      params.push(param);
    }

    const route = {
      name: name,
      action: routeAction,
      params: params,
    };
    this.routes.set(name, route);
    return routeAction;
  }

  public async match(request: IRequest) {
    const matched = this.routes.get(request.method);
    if (matched === undefined) {
      throw new MethodNotFound(request.method);
    }

    return matched.action(request);
  }

  public getAll(): ({ name: string; params: { name: string }[] })[] {
    const results = [];
    const routes = this.routes.values();
    for (const route of routes) {
      results.push({ name: route.name, params: route.params });
    }

    return results;
  }
}
