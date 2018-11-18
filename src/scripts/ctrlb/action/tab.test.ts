import { TabActionGroup } from "./tab";
import { Tabs } from "webextension-polyfill-ts";

describe("TabActionGroup", () => {
  let create: jest.Mock;
  let get: jest.Mock;
  let update: jest.Mock;
  let query: jest.Mock;
  let reload: jest.Mock;
  let move: jest.Mock;
  let remove: jest.Mock;
  let duplicate: jest.Mock;
  let actionGroup: TabActionGroup;
  let tabList: Tabs.Tab[];
  let tab: Tabs.Tab;
  const tabId = 1;
  const tabIndex = 2;
  const TabClass = jest.fn<Tabs.Tab>((id, index) => ({
    id: id,
    index: index,
  }));

  beforeEach(() => {
    create = jest.fn();
    get = jest.fn();
    update = jest.fn();
    query = jest.fn();
    reload = jest.fn();
    move = jest.fn();
    remove = jest.fn();
    duplicate = jest.fn();

    tab = new TabClass(tabId, tabIndex);
    tabList = [tab];
    query.mockReturnValue(tabList);

    const TabsClass = jest.fn<Tabs.Static>(() => ({
      create: create,
      get: get,
      update: update,
      query: query,
      reload: reload,
      move: move,
      remove: remove,
      duplicate: duplicate,
    }));

    actionGroup = new TabActionGroup(new TabsClass());
  });

  it("activate", async () => {
    get.mockReturnValue(tab);
    await actionGroup.activate(tabId);
    expect(get).toHaveBeenCalledWith(tabId);
    expect(update).toHaveBeenCalledWith(tabId, { active: true });
  });

  it("create", () => {
    actionGroup.create();
    expect(create).toHaveBeenCalledWith({});
  });

  it("get", async () => {
    await actionGroup.get(tabId);
    expect(get).toHaveBeenCalledWith(tabId);
  });

  it("list on current window", async () => {
    await actionGroup.list();
    expect(query).toHaveBeenCalledWith({ currentWindow: true });
  });

  it("first on current window", async () => {
    await actionGroup.first();
    expect(update).toHaveBeenCalledWith(tabId, { active: true });
  });

  it("last on current window", async () => {
    await actionGroup.last();
    expect(update).toHaveBeenCalledWith(tabId, { active: true });
  });

  it("moveRight on current window", async () => {
    await actionGroup.moveRight();
    expect(move).toHaveBeenCalledWith(tabId, { index: tabIndex + 1 });
  });

  it("moveLeft on current window", async () => {
    await actionGroup.moveLeft();
    expect(move).toHaveBeenCalledWith(tabId, { index: tabIndex - 1 });
  });

  it("moveFirst on current window", async () => {
    await actionGroup.moveFirst();
    expect(move).toHaveBeenCalledWith(tabId, { index: 0 });
  });

  it("moveLast on current window", async () => {
    await actionGroup.moveLast();
    expect(move).toHaveBeenCalledWith(tabId, { index: -1 });
  });

  it("close on current window", async () => {
    await actionGroup.close();
    expect(remove).toHaveBeenCalledWith(tabId);
  });

  it("closeRight on current window", async () => {
    const tab2 = new TabClass(2, 5);
    const tab3 = new TabClass(3, 6);
    const tab4 = new TabClass(4, 1);
    const tabs = [tab2, tab3, tab4];
    query.mockReturnValueOnce(tabList).mockReturnValueOnce(tabs);
    await actionGroup.closeRight();
    expect(remove).toHaveBeenCalledWith([2, 3]);
  });

  it("closeLeft on current window", async () => {
    const tab2 = new TabClass(2, 5);
    const tab3 = new TabClass(3, 6);
    const tab4 = new TabClass(4, 1);
    const tabs = [tab2, tab3, tab4];
    query.mockReturnValueOnce(tabList).mockReturnValueOnce(tabs);
    await actionGroup.closeLeft();
    expect(remove).toHaveBeenCalledWith([4]);
  });

  it("closeOthers on current window", async () => {
    const tab2 = new TabClass(2, 5);
    const tab3 = new TabClass(3, 6);
    const tab4 = new TabClass(4, 1);
    const tabs = [tab2, tab3, tab4];
    query.mockReturnValueOnce(tabList).mockReturnValueOnce(tabs);
    await actionGroup.closeOthers();
    expect(remove).toHaveBeenCalledWith([2, 3, 4]);
  });

  it("previous on current window", async () => {
    const tab2 = new TabClass(2, 1);
    query.mockReturnValueOnce(tabList).mockReturnValueOnce([tab2]);
    await actionGroup.previous();
    expect(query).toHaveBeenCalledWith({
      currentWindow: true,
      index: tabIndex - 1,
    });
    expect(update).toHaveBeenCalledWith(2, { active: true });
  });

  it("previous on current window first tab", async () => {
    const tab1 = new TabClass(1, 0);
    const tab2 = new TabClass(2, 5);
    query.mockReturnValueOnce([tab1]).mockReturnValue([tab2]);
    await actionGroup.previous();
    expect(update).toHaveBeenCalledWith(2, { active: true });
  });

  it("next on current window", async () => {
    const lastTab = new TabClass(3, 4);
    const tab2 = new TabClass(2, 3);
    query
      .mockReturnValueOnce(tabList)
      .mockReturnValueOnce([lastTab])
      .mockReturnValueOnce([lastTab])
      .mockReturnValueOnce([tab2]);
    await actionGroup.next();
    expect(query).toHaveBeenCalledWith({
      currentWindow: true,
      index: tabIndex + 1,
    });
    expect(update).toHaveBeenCalledWith(2, { active: true });
  });

  it("next on current window last tab", async () => {
    const tab1 = new TabClass(2, 0);
    const lastTab = new TabClass(3, 4);
    query
      .mockReturnValueOnce([lastTab])
      .mockReturnValueOnce([lastTab])
      .mockReturnValueOnce([lastTab])
      .mockReturnValueOnce([tab1]);
    await actionGroup.next();
    expect(query).toHaveBeenCalledWith({
      currentWindow: true,
      index: 0,
    });
    expect(update).toHaveBeenCalledWith(2, { active: true });
  });

  it("tabOpen on current window", async () => {
    const url = "url";
    await actionGroup.tabOpen(url);
    expect(create).toHaveBeenCalledWith({ url: url });
  });

  it("open on current window", async () => {
    const url = "url";
    await actionGroup.open(url);
    expect(update).toHaveBeenCalledWith(tabId, { url: url });
  });

  it("duplicate on current window", async () => {
    await actionGroup.duplicate();
    expect(duplicate).toHaveBeenCalledWith(tabId);
  });

  it("reload current", async () => {
    await actionGroup.reload();
    expect(reload).toHaveBeenCalledWith(tabId);
  });
});
