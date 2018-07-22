import { ActionArgs, ResultInfo, Action, ActionInvoker } from "./action";
import { History } from "webextension-polyfill-ts";

export class HistoryActionGroup {
  constructor(protected readonly history: History.Static) {}

  public async search(text: string | null = null): Promise<ResultInfo> {
    if (text === null) {
      return { body: [] };
    }
    const histories = await this.history.search({ text: text });
    return { body: histories };
  }
}

export class HistoryActionInvoker extends ActionInvoker<HistoryActionGroup> {
  public readonly search: Action;

  constructor(actionGroup: HistoryActionGroup) {
    super(actionGroup);

    this.search = (args: ActionArgs) => {
      const a = this.v.has({ input: this.v.optionalString() }, args);
      return actionGroup.search(a.input);
    };
  }
}
