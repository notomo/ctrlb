import { Downloads } from "webextension-polyfill-ts";

export class DownloadActionGroup {
  constructor(protected readonly downloads: Downloads.Static) {}

  public async search(input: string | null): Promise<Downloads.DownloadItem[]> {
    const limit = 100;
    if (input === null) {
      return this.downloads.search({ query: [""], limit: limit });
    }

    return this.downloads.search({ query: [input], limit: limit });
  }
}
