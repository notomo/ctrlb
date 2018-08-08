import { Action, ActionInvoker } from "./action";
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

export class WindowActionInvoker extends ActionInvoker<WindowActionGroup> {
  public readonly get: Action;
  public readonly removeLastFocused: Action;
  public readonly remove: Action;
  public readonly activate: Action;
  public readonly maximize: Action;
  public readonly minimize: Action;
  public readonly toFullScreen: Action;
  public readonly toNormal: Action;
  public readonly list: Action;

  constructor(actionGroup: WindowActionGroup) {
    super(actionGroup);

    const idArgsActions = {
      get: actionGroup.get,
      remove: actionGroup.remove,
      activate: actionGroup.activate
    };

    this.get = this.idArgsAction(idArgsActions, "get");
    this.remove = this.idArgsAction(idArgsActions, "remove");
    this.activate = this.idArgsAction(idArgsActions, "activate");

    const noArgsActions = {
      removeLastFocused: actionGroup.removeLastFocused,
      maximize: actionGroup.maximize,
      minimize: actionGroup.minimize,
      toFullScreen: actionGroup.toFullScreen,
      toNormal: actionGroup.toNormal,
      list: actionGroup.list
    };

    this.removeLastFocused = this.noArgsAction(
      noArgsActions,
      "removeLastFocused"
    );
    this.maximize = this.noArgsAction(noArgsActions, "maximize");
    this.minimize = this.noArgsAction(noArgsActions, "minimize");
    this.toFullScreen = this.noArgsAction(noArgsActions, "toFullScreen");
    this.toNormal = this.noArgsAction(noArgsActions, "toNormal");
    this.list = this.noArgsAction(noArgsActions, "list");
  }
}
