import { Tabs } from "webextension-polyfill-ts";

export class ZoomActionGroup {
  constructor(protected readonly tabs: Tabs.Static) {}

  public get(tabId: number | null): Promise<number> {
    return this.tabs.getZoom(tabId || undefined);
  }

  public set(zoomFactor: number, tabId: number | null): null {
    this.tabs.setZoom(tabId || undefined, zoomFactor);
    return null;
  }

  public reset(tabId: number | null): null {
    this.tabs.setZoom(tabId || undefined, 0);
    return null;
  }

  public async up(tabId: number | null): Promise<null> {
    const id = tabId || undefined;
    const currentZoomFactor = await this.tabs.getZoom(id);
    this.tabs.setZoom(id, currentZoomFactor + 0.1);
    return null;
  }

  public async down(tabId: number | null): Promise<null> {
    const id = tabId || undefined;
    const zoomFactor = (await this.tabs.getZoom(id)) - 0.1;
    if (zoomFactor < 0.1) {
      return null;
    }
    this.tabs.setZoom(id, zoomFactor);
    return null;
  }
}
