import { ActionArgs, ActionKind, ActionGroup, ResultInfo } from "./action";

export class HistoryKind extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      search: {
        f: (args: ActionArgs) => {
          const a = this.has({ input: this.optionalString }, args);
          return this.search(a.input);
        }
      }
    };
  }

  protected async search(text?: string): Promise<ResultInfo> {
    if (text === undefined) {
      return { body: [] };
    }
    const histories = await this.browser.history.search({ text: text });
    return { body: histories };
  }
}
