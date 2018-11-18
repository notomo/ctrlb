import { browser } from "webextension-polyfill-ts";
import { ScrollActionGroup } from "./action/scroll";
import { ZoomActionGroup } from "./action/zoom";
import { Router } from "./router";
import { Validator } from "./validator";

export class Di {
  protected static readonly deps: Deps = {
    ScrollActionGroup: () => {
      return new ScrollActionGroup(browser.tabs);
    },
    ZoomActionGroup: () => {
      return new ZoomActionGroup(browser.tabs);
    },
    Router: () => {
      const validator = Di.get("Validator");
      return new Router(validator);
    },
    Validator: () => {
      return new Validator();
    },
  };

  protected static readonly cache: DepsCache = {
    ScrollActionGroup: null,
    ZoomActionGroup: null,
    Router: null,
    Validator: null,
  };

  public static get(cls: "ScrollActionGroup"): ScrollActionGroup;
  public static get(cls: "ZoomActionGroup"): ZoomActionGroup;
  public static get(cls: "Router"): Router;
  public static get(cls: "Validator"): Validator;
  public static get(
    cls: keyof Deps,
    cacheable: boolean = true,
    ...args: any[]
  ): ReturnType<Deps[keyof Deps]> {
    const cache = this.cache[cls];
    if (cache !== null) {
      return cache;
    }
    const resolved = this.deps[cls](...args);
    if (cacheable) {
      this.cache[cls] = resolved;
    }
    return resolved;
  }

  public static set(
    cls: keyof Deps,
    value: ReturnType<Deps[keyof Deps]>
  ): void {
    this.cache[cls] = value;
  }

  public static clear(): void {
    for (const key of Object.keys(this.deps)) {
      this.cache[key as keyof DepsCache] = null;
    }
  }
}

interface Deps {
  ScrollActionGroup: { (...args: any[]): ScrollActionGroup };
  ZoomActionGroup: { (...args: any[]): ZoomActionGroup };
  Router: { (...args: any[]): Router };
  Validator: { (...args: any[]): Validator };
}

type DepsCache = { [P in keyof Deps]: ReturnType<Deps[P]> | null };
