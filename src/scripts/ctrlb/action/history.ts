import { ActionArgs, ActionKind, ActionGroup, ResultInfo } from "./action";

export class History extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      search: (args: ActionArgs) => this.search(args)
    };
  }

  protected async search(args: ActionArgs): Promise<ResultInfo> {
    const text: string = args.input as string;
    if (text === undefined) {
      return { status: "ok", body: [] };
    }
    return await this.chrome.history
      .search({ text: text })
      .then((histories: chrome.history.HistoryItem[]) => {
        return { status: "ok", body: histories };
      });
  }
}
