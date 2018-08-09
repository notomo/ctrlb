import { ActionFacade } from "./invoker";
import { Browser, Storage, Tabs } from "webextension-polyfill-ts";

describe("ActionFacade", () => {
  let facade: ActionFacade;
  let executeScript: jest.Mock;

  beforeEach(() => {
    const StorageClass = jest.fn<Storage.Static>(() => ({}));
    const storage = new StorageClass();

    executeScript = jest.fn();
    const TabsClass = jest.fn<Tabs.Static>(() => ({
      executeScript: executeScript
    }));
    const tabs = new TabsClass();

    const BrowserClass = jest.fn<Browser>(() => ({
      storage: storage,
      tabs: tabs
    }));
    const browser = new BrowserClass();

    facade = new ActionFacade(browser);
  });

  it("execute", async () => {
    await facade.execute("scroll", "up");
    expect(executeScript).toHaveBeenCalledTimes(1);
  });

  it("throw error if invalid action group name", async () => {
    expect(facade.execute("invalid", "up")).rejects.toEqual(
      new Error("invalid is not actionGroup.")
    );
  });

  it("throw error if invalid action name", async () => {
    expect(facade.execute("scroll", "invalid")).rejects.toEqual(
      new Error("invalid is not scroll's action.")
    );
  });
});
