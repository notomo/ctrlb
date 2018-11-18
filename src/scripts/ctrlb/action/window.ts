import { Windows } from "webextension-polyfill-ts";

export class WindowActionGroup {
  constructor(protected readonly windows: Windows.Static) {}

  public async get(windowId: number): Promise<Windows.Window> {
    return this.windows.get(windowId);
  }

  public maximize(): Promise<null> {
    return this.updateState("maximized");
  }

  public minimize(): Promise<null> {
    return this.updateState("minimized");
  }

  public toFullScreen(): Promise<null> {
    return this.updateState("fullscreen");
  }

  public toNormal(): Promise<null> {
    return this.updateState("normal");
  }

  public async removeLastFocused(): Promise<null> {
    const win = await this.getLastFocused();
    if (win.id === undefined) {
      return null;
    }
    return this.remove(win.id);
  }

  public async remove(windowId: number): Promise<null> {
    this.windows.remove(windowId);
    return null;
  }

  public activate(windowId: number): null {
    this.windows.update(windowId, { focused: true });
    return null;
  }

  public async list(): Promise<Windows.Window[]> {
    return await this.windows.getAll({ populate: true });
  }

  protected async updateState(state: Windows.WindowState): Promise<null> {
    const win = await this.getLastFocused();
    if (win.id === undefined) {
      return null;
    }
    this.windows.update(win.id, { state: state });
    return null;
  }

  protected async getLastFocused(): Promise<Windows.Window> {
    return await this.windows.getLastFocused();
  }
}
