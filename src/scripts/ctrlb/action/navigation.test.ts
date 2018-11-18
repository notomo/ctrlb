import { NavigationActionGroup } from "./navigation";
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
