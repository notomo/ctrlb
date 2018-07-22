import { ZoomActionGroup } from "./zoom";
import { Tabs } from "webextension-polyfill-ts";

describe("ZoomActionGroup", () => {
  let setZoom: jest.Mock;
  let getZoom: jest.Mock;
  let actionGroup: ZoomActionGroup;

  beforeEach(() => {
    setZoom = jest.fn();
    getZoom = jest.fn();

    const TabsClass = jest.fn<Tabs.Static>(() => ({
      setZoom: setZoom,
      getZoom: getZoom.mockReturnValue(1.0)
    }));
    const tabs = new TabsClass();

    actionGroup = new ZoomActionGroup(tabs);
  });

  it("set", () => {
    const zoomFactor = 0.5;
    actionGroup.set(zoomFactor);

    expect(setZoom).toHaveBeenCalledWith(zoomFactor);
  });

  it("reset", () => {
    actionGroup.reset();

    expect(setZoom).toHaveBeenCalledWith(0);
  });

  it("up", async () => {
    await actionGroup.up();

    expect(getZoom).toHaveBeenCalledTimes(1);
    expect(setZoom).toHaveBeenCalledWith(1.1);
  });

  it("down", async () => {
    await actionGroup.down();

    expect(getZoom).toHaveBeenCalledTimes(1);
    expect(setZoom).toHaveBeenCalledWith(0.9);
  });

  it("not down", async () => {
    getZoom.mockReturnValue(0.1);
    await actionGroup.down();

    expect(getZoom).toHaveBeenCalledTimes(1);
    expect(setZoom).not.toHaveBeenCalledTimes(1);
  });
});