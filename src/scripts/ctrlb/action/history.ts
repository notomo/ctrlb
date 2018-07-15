import { ActionArgs, ActionKind, ActionGroup, ResultInfo } from "./action";
import { History } from "./facade";

export class HistoryKind extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      search: (args: ActionArgs) => this.search(args)
    };
  }

  protected async search(args: ActionArgs): Promise<ResultInfo> {
    const text: string = args.input as string;
    if (text === undefined) {
      return { body: [] };
    }
    return await this.browser.history
      .search({ text: text })
      .then((histories: History[]) => {
        return { body: histories };
      });
  }
}
