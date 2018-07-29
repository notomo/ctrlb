import { WindowActionGroup, WindowActionInvoker } from "./window";
import { Windows } from "webextension-polyfill-ts";

describe("WindowActionGroup", () => {
  let update: jest.Mock;
  let remove: jest.Mock;
  let getAll: jest.Mock;
  let getLastFocused: jest.Mock;
  let actionGroup: WindowActionGroup;
  const windowId = 1;

  beforeEach(() => {
    update = jest.fn();
    remove = jest.fn();
    getAll = jest.fn();
    getLastFocused = jest.fn();

    const WindowsClass = jest.fn<Windows.Static>(() => ({
      update: update,
      remove: remove,
      getAll: getAll,
      getLastFocused: getLastFocused.mockReturnValue({ id: windowId })
    }));
    const windows = new WindowsClass();

    actionGroup = new WindowActionGroup(windows);
  });

  it("maximize", async () => {
    await actionGroup.maximize();
    expect(update).toHaveBeenCalledWith(windowId, { state: "maximized" });
  });

  it("updateState return null when window has not id", async () => {
    getLastFocused.mockReturnValue({});
    const result = await actionGroup.maximize();
    expect(result).toBeNull();
  });

  it("minimize", async () => {
    await actionGroup.minimize();
    expect(update).toHaveBeenCalledWith(windowId, { state: "minimized" });
  });

  it("toFullScreen", async () => {
    await actionGroup.toFullScreen();
    expect(update).toHaveBeenCalledWith(windowId, { state: "fullscreen" });
  });

  it("toNormal", async () => {
    await actionGroup.toNormal();
    expect(update).toHaveBeenCalledWith(windowId, { state: "normal" });
  });

  it("removeLastFocused", async () => {
    await actionGroup.removeLastFocused();
    expect(remove).toHaveBeenCalledWith(windowId);
  });

  it("removeLastFocused return null when window has not id", async () => {
    getLastFocused.mockReturnValue({});
    const result = await actionGroup.removeLastFocused();
    expect(result).toBeNull();
  });

  it("remove", async () => {
    await actionGroup.remove(windowId);
    expect(remove).toHaveBeenCalledWith(windowId);
  });

  it("activate", () => {
    actionGroup.activate(windowId);
    expect(update).toHaveBeenCalledWith(windowId, { focused: true });
  });

  it("list", async () => {
    await actionGroup.list();
    expect(getAll).toHaveBeenCalledWith({ populate: true });
  });
});

describe("WindowActionInvoker", () => {
  it("constructor", () => {
    const ActionGroupClass = jest.fn<WindowActionGroup>(() => ({}));
    const actionGroup = new ActionGroupClass();

    new WindowActionInvoker(actionGroup);
  });
});
