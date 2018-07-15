import { ActionArgs, ActionKind, ActionGroup, ResultInfo } from "./action";
import { Win } from "./facade";

export class WindowKind extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      maximize: (args: ActionArgs) => this.maximize(args),
      minimize: (args: ActionArgs) => this.minimize(args),
      toFullScreen: (args: ActionArgs) => this.toFullScreen(args),
      toNormal: (args: ActionArgs) => this.toNormal(args),
      remove: (args: ActionArgs) => this.remove(args),
      list: (args: ActionArgs) => this.list(args),
      activate: (args: ActionArgs) => this.activate(args),
      removeLastFocused: (args: ActionArgs) => this.removeLastFocused(args)
    };
  }

  protected async removeLastFocused(args: ActionArgs): Promise<ResultInfo> {
    return this.getLastFocused().then((win: Win) => {
      return this.remove({ id: win.id });
    });
  }

  protected async remove(args: ActionArgs): Promise<ResultInfo> {
    if (args.id === undefined) {
      return { status: "invalid" };
    }
    const windowId = args.id as number;
    this.browser.windows.remove(windowId);
    return { status: "ok" };
  }

  protected async activate(args: ActionArgs): Promise<ResultInfo> {
    if (args.id === undefined) {
      return { status: "invalid" };
    }
    const windowId = args.id as number;
    this.browser.windows.update(windowId, { focused: true });
    return { status: "ok" };
  }

  protected async list(args: ActionArgs): Promise<ResultInfo> {
    const windows = await this.browser.windows.getAll({ populate: true });
    return { status: "ok", body: windows };
  }

  protected async toNormal(args: ActionArgs): Promise<ResultInfo> {
    return this.updateState("normal");
  }

  protected async toFullScreen(args: ActionArgs): Promise<ResultInfo> {
    return this.updateState("fullscreen");
  }

  protected async maximize(args: ActionArgs): Promise<ResultInfo> {
    return this.updateState("maximized");
  }

  protected async minimize(args: ActionArgs): Promise<ResultInfo> {
    return this.updateState("minimized");
  }

  private async updateState(state: string): Promise<ResultInfo> {
    return await this.getLastFocused()
      .then((win: Win) => {
        return this.browser.windows.update(win.id, { state: state });
      })
      .then((win: Win) => {
        return { status: "ok" };
      });
  }

  private async getLastFocused(): Promise<Win> {
    return await this.browser.windows.getLastFocused();
  }
}
