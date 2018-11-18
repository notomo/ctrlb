import { Tabs } from "webextension-polyfill-ts";

export class ZoomActionGroup {
  constructor(protected readonly tabs: Tabs.Static) {}

  public get(): Promise<number> {
    return this.tabs.getZoom();
  }

  public set(zoomFactor: number): null {
    this.tabs.setZoom(zoomFactor);
    return null;
  }

  public reset(): null {
    this.tabs.setZoom(0);
    return null;
  }

  public async up(): Promise<null> {
    const currentZoomFactor = await this.tabs.getZoom();
    this.tabs.setZoom(currentZoomFactor + 0.1);
    return null;
  }

  public async down(): Promise<null> {
    const zoomFactor = (await this.tabs.getZoom()) - 0.1;
    if (zoomFactor < 0.1) {
      return null;
    }
    this.tabs.setZoom(zoomFactor);
    return null;
  }
}
