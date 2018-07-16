import { ActionArgs, ActionKind, ActionGroup, ResultInfo } from "./action";
import { Win } from "./facade";

export class WindowKind extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      maximize: () => this.updateState("maximized"),
      minimize: () => this.updateState("minimized"),
      toFullScreen: () => this.updateState("fullscreen"),
      toNormal: () => this.updateState("normal"),
      remove: {
        f: (args: ActionArgs) => this.remove(this.hasId(args))
      },
      list: () => this.list(),
      activate: {
        f: (args: ActionArgs) => this.activate(this.hasId(args))
      },
      removeLastFocused: () => this.removeLastFocused()
    };
  }

  protected async removeLastFocused(): Promise<null> {
    const win = await this.getLastFocused();
    return this.remove(win.id);
  }

  protected async remove(windowId: number): Promise<null> {
    this.browser.windows.remove(windowId);
    return null;
  }

  protected activate(windowId: number): null {
    this.browser.windows.update(windowId, { focused: true });
    return null;
  }

  protected async list(): Promise<ResultInfo> {
    const windows = await this.browser.windows.getAll({ populate: true });
    return { body: windows };
  }

  private async updateState(state: string): Promise<null> {
    const win = await this.getLastFocused();
    this.browser.windows.update(win.id, { state: state });
    return null;
  }

  private async getLastFocused(): Promise<Win> {
    return await this.browser.windows.getLastFocused();
  }
}
