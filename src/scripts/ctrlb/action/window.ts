import { ResultInfo, Action } from "./action";
import { Validator } from "./validator";
import { Windows } from "webextension-polyfill-ts";

export class WindowActionGroup {
  constructor(protected readonly windows: Windows.Static) {}

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

  public async list(): Promise<ResultInfo> {
    const windows = await this.windows.getAll({ populate: true });
    return { body: windows };
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

export class WindowActionInvoker {
  public readonly removeLastFocused: Action;
  public readonly remove: Action;
  public readonly activate: Action;
  public readonly maximize: Action;
  public readonly minimize: Action;
  public readonly toFullScreen: Action;
  public readonly toNormal: Action;
  public readonly list: Action;

  constructor(actionGroup: WindowActionGroup, v: Validator) {
    this.removeLastFocused = v.noArgs(
      actionGroup["removeLastFocused"],
      actionGroup
    );
    this.remove = v.idArgs(actionGroup["remove"], actionGroup);
    this.activate = v.idArgs(actionGroup["activate"], actionGroup);
    this.maximize = v.noArgs(actionGroup["maximize"], actionGroup);
    this.minimize = v.noArgs(actionGroup["minimize"], actionGroup);
    this.toFullScreen = v.noArgs(actionGroup["toFullScreen"], actionGroup);
    this.toNormal = v.noArgs(actionGroup["toNormal"], actionGroup);
    this.list = v.noArgs(actionGroup["list"], actionGroup);
  }
}
