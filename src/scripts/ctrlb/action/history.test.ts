import { HistoryActionGroup, HistoryActionInvoker } from "./history";
import { History } from "webextension-polyfill-ts";

describe("HistoryActionGroup", () => {
  let search: jest.Mock;
  let actionGroup: HistoryActionGroup;

  beforeEach(() => {
    search = jest.fn();

    const HistoryClass = jest.fn<History.Static>(() => ({
      search: search,
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
});

describe("HistoryActionInvoker", () => {
  let search: jest.Mock;
  let invoker: HistoryActionInvoker;

  beforeEach(() => {
    search = jest.fn();

    const ActionGroupClass = jest.fn<HistoryActionGroup>(() => ({
      search: search,
    }));
    const actionGroup = new ActionGroupClass();

    invoker = new HistoryActionInvoker(actionGroup);
  });

  it("search", () => {
    const input = "input";
    invoker.search({ input: input });
    expect(search).toHaveBeenCalledWith(input);
  });
});
