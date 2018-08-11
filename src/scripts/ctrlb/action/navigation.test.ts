import { NavigationActionGroup, NavigationActionInvoker } from "./navigation";
import { Tabs } from "webextension-polyfill-ts";

describe("NavigationActionGroup", () => {
  let executeScript: jest.Mock;
  let actionGroup: NavigationActionGroup;

  beforeEach(() => {
    executeScript = jest.fn();

    const TabsClass = jest.fn<Tabs.Static>(() => ({
      executeScript: executeScript,
    }));
    const tabs = new TabsClass();

    actionGroup = new NavigationActionGroup(tabs);
  });

  it("back", () => {
    actionGroup.back();
    expect(executeScript).toHaveBeenCalledTimes(1);
  });

  it("forward", () => {
    actionGroup.forward();
    expect(executeScript).toHaveBeenCalledTimes(1);
  });
});

describe("NavigationActionInvoker", () => {
  let back: jest.Mock;
  let forward: jest.Mock;
  let invoker: NavigationActionInvoker;

  beforeEach(() => {
    back = jest.fn();
    forward = jest.fn();

    const ActionGroupClass = jest.fn<NavigationActionGroup>(() => ({
      back: back,
      forward: forward,
    }));
    const actionGroup = new ActionGroupClass();

    invoker = new NavigationActionInvoker(actionGroup);
  });

  it("back", () => {
    invoker.back({});
    expect(back).toHaveBeenCalledTimes(1);
  });

  it("forward", () => {
    invoker.forward({});
    expect(forward).toHaveBeenCalledTimes(1);
  });
});
