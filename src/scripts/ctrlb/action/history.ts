import { ActionArgs, ActionKind, ActionGroup, ResultInfo } from "./action";
import { History } from "./facade";

export class HistoryKind extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      search: {
        f: (args: ActionArgs) => {
          const a = this.has({ input: this.optionalString }, args);
          this.search(a.input);
        }
      }
    };
  }

  protected async search(text?: string): Promise<ResultInfo> {
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
