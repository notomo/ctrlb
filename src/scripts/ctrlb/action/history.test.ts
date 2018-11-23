import { HistoryActionGroup } from "./history";
import { History } from "webextension-polyfill-ts";

describe("HistoryActionGroup", () => {
  let search: jest.Mock;
  let deleteUrl: jest.Mock;
  let actionGroup: HistoryActionGroup;

  beforeEach(() => {
    search = jest.fn();
    deleteUrl = jest.fn();

    const HistoryClass = jest.fn<History.Static>(() => ({
      search: search,
      deleteUrl: deleteUrl,
    }));
    const history = new HistoryClass();

    actionGroup = new HistoryActionGroup(history);
  });

  it("search", () => {
    const text = "text";
    actionGroup.search(text);
    expect(search).toHaveBeenCalledWith({ text: text });
  });

  it("search return empty if input is null.", async () => {
    await actionGroup.search();
    expect(search).toHaveBeenCalledWith({ text: "" });
  });

  it("remove", () => {
    const url = "url";
    actionGroup.remove(url);
    expect(deleteUrl).toHaveBeenCalledWith({ url: url });
  });
});
