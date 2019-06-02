import { ScrollActionGroup } from "./scroll";
import { Tabs } from "webextension-polyfill-ts";

describe("ScrollActionGroup", () => {
  let executeScript: jest.Mock;
  let actionGroup: ScrollActionGroup;

  beforeEach(() => {
    executeScript = jest.fn();

    const TabsClass: jest.Mock<Tabs.Static> = jest.fn(() => ({
      executeScript: executeScript,
    })) as any;
    const tabs = new TabsClass();

    actionGroup = new ScrollActionGroup(tabs);
  });

  it("toTop", () => {
    actionGroup.toTop();
    expect(executeScript).toHaveBeenCalledTimes(1);
  });

  it("toBottom", () => {
    actionGroup.toBottom();
    expect(executeScript).toHaveBeenCalledTimes(1);
  });

  it("up", () => {
    actionGroup.up();
    expect(executeScript).toHaveBeenCalledTimes(1);
  });

  it("down", () => {
    actionGroup.down();
    expect(executeScript).toHaveBeenCalledTimes(1);
  });
});
