import { History } from "webextension-polyfill-ts";

export class HistoryActionGroup {
  constructor(protected readonly history: History.Static) {}

  public async search(
    text: string | null = null
  ): Promise<History.HistoryItem[]> {
    return await this.history.search({ text: text || "" });
  }
}
