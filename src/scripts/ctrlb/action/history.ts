import { ActionArgs, ResultInfo, Action } from "./action";
import { Validator } from "./validator";
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

export class HistoryActionInvoker {
  public readonly search: Action;

  constructor(
    actionGroup: HistoryActionGroup,
    v: Validator<HistoryActionGroup>
  ) {
    this.search = (args: ActionArgs) => {
      const a = v.has({ input: v.optionalString() }, args);
      return actionGroup.search(a.input);
    };
  }
}
