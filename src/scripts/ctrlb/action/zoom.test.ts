import { ZoomActionGroup } from "./zoom";
import { Tabs } from "webextension-polyfill-ts";

describe("ZoomActionGroup", () => {
  let setZoom: jest.Mock;
  let getZoom: jest.Mock;
  let actionGroup: ZoomActionGroup;

  beforeEach(() => {
    setZoom = jest.fn();
    getZoom = jest.fn();

    const TabsClass: jest.Mock<Tabs.Static> = jest.fn(() => ({
      setZoom: setZoom,
      getZoom: getZoom.mockReturnValue(1.0),
    })) as any;
    const tabs = new TabsClass();

    actionGroup = new ZoomActionGroup(tabs);
  });

  it("get", async () => {
    await actionGroup.get(null);

    expect(getZoom).toHaveBeenCalledTimes(1);
  });

  it("set", () => {
    const zoomFactor = 0.5;
    actionGroup.set(zoomFactor, null);

    expect(setZoom).toHaveBeenCalledWith(undefined, zoomFactor);
  });

  it("reset", () => {
    actionGroup.reset(null);

    expect(setZoom).toHaveBeenCalledWith(undefined, 0);
  });

  it("up", async () => {
    await actionGroup.up(null);

    expect(getZoom).toHaveBeenCalledTimes(1);
    expect(setZoom).toHaveBeenCalledWith(undefined, 1.1);
  });

  it("down", async () => {
    await actionGroup.down(null);

    expect(getZoom).toHaveBeenCalledTimes(1);
    expect(setZoom).toHaveBeenCalledWith(undefined, 0.9);
  });

  it("not down", async () => {
    getZoom.mockReturnValue(0.1);
    await actionGroup.down(null);

    expect(getZoom).toHaveBeenCalledTimes(1);
    expect(setZoom).not.toHaveBeenCalledTimes(1);
  });
});
