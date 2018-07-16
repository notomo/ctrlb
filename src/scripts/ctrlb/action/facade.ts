import { TabKind } from "./tab";
import { BookmarkKind } from "./bookmark";
import { HistoryKind } from "./history";
import { WindowKind } from "./window";
import { ScrollKind } from "./scroll";
import { NavigationKind } from "./navigation";
import { TextToSpeakKind } from "./text_to_speak";
import { ZoomKind } from "./zoom";
import { ActionInfo, ActionKind, ResultInfo } from "./action";
import ChromePromise from "chrome-promise";

export interface Browser extends ChromePromise {}
export interface Tab extends chrome.tabs.Tab {}
export interface Win extends chrome.windows.Window {}
export interface BookmarkItem extends chrome.bookmarks.BookmarkTreeNode {}

interface ActionKindConstructor {
  new (browser: Browser): ActionKind;
}

interface ActionKindConstructors {
  [index: string]: ActionKindConstructor;
}

export class ActionFacade {
  protected readonly browser: Browser;

  constructor(browser: Browser) {
    this.browser = browser;
  }

  public async execute(json: any): Promise<ResultInfo> {
    const actionInfo = json as ActionInfo;
    const actionKinds: ActionKindConstructors = {
      tab: TabKind,
      bookmark: BookmarkKind,
      history: HistoryKind,
      window: WindowKind,
      scroll: ScrollKind,
      navigation: NavigationKind,
      textToSpeak: TextToSpeakKind,
      zoom: ZoomKind
    };
    const actionKindClass = actionKinds[actionInfo.kindName];
    const actionKind = new actionKindClass(this.browser);
    const result = await actionKind.execute(
      actionInfo.actionName,
      actionInfo.args
    );
    if (result === null) {
      return {};
    }
    return result;
  }
}

// TODO send api info
