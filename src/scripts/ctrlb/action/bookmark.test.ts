import {
  BookmarkActionGroup,
  BookmarkActionInvoker,
  NotFoundBookmark,
} from "./bookmark";
import { TabActionGroup } from "./tab";
import { Bookmarks } from "webextension-polyfill-ts";

describe("BookmarkActionGroup", () => {
  let open: jest.Mock;
  let tabGroupOpen: jest.Mock;
  let tabGroupTabOpen: jest.Mock;
  let remove: jest.Mock;
  let removeTree: jest.Mock;
  let create: jest.Mock;
  let getRecent: jest.Mock;
  let search: jest.Mock;
  let get: jest.Mock;
  let update: jest.Mock;
  let getTree: jest.Mock;
  let getSubTree: jest.Mock;
  let actionGroup: BookmarkActionGroup;
  const bookmarkId = "1";
  const bookmarkUrl = "bookmarkUrl";

  beforeEach(() => {
    open = jest.fn();
    tabGroupOpen = jest.fn();
    tabGroupTabOpen = jest.fn();
    remove = jest.fn();
    removeTree = jest.fn();
    create = jest.fn();
    getRecent = jest.fn(() => {
      return [
        {
          id: bookmarkId,
          url: bookmarkUrl,
          title: "title",
        },
      ];
    });
    search = jest.fn(() => {
      return [
        {
          id: bookmarkId,
          url: bookmarkUrl,
          title: "title",
        },
      ];
    });
    get = jest.fn();
    update = jest.fn();

    const BookmarkTreeNodeClass = jest.fn<Bookmarks.BookmarkTreeNode>(() => ({
      parentId: "2",
      children: [],
    }));
    const bookmarkTreeNode = new BookmarkTreeNodeClass();

    getTree = jest.fn().mockReturnValue([bookmarkTreeNode]);
    getSubTree = jest.fn().mockReturnValue([bookmarkTreeNode]);

    const BookmarksClass = jest.fn<Bookmarks.Static>(() => ({
      open: open,
      get: get.mockReturnValue([{ id: bookmarkId, url: bookmarkUrl }]),
      remove: remove,
      removeTree: removeTree,
      create: create,
      getRecent: getRecent,
      search: search,
      update: update,
      getTree: getTree,
      getSubTree: getSubTree,
    }));
    const bookmarks = new BookmarksClass();

    const TabActionGroupClass = jest.fn<TabActionGroup>(() => ({
      open: tabGroupOpen,
      tabOpen: tabGroupTabOpen,
    }));
    const tabActionGroup = new TabActionGroupClass();

    actionGroup = new BookmarkActionGroup(tabActionGroup, bookmarks);
  });

  it("open", async () => {
    await actionGroup.open(bookmarkId);
    expect(tabGroupOpen).toHaveBeenCalledWith(bookmarkUrl);
  });

  it("open bookmark has not url", async () => {
    get.mockReturnValue([{ id: bookmarkId }]);
    const result = await actionGroup.open(bookmarkId);
    expect(result).toBeNull();
  });

  it("open bookmark but not found", async () => {
    get.mockReturnValue([]);
    expect(actionGroup.open(bookmarkId)).rejects.toEqual(
      new NotFoundBookmark("1")
    );
  });

  it("tabOpen", async () => {
    await actionGroup.tabOpen(bookmarkId);
    expect(tabGroupTabOpen).toHaveBeenCalledWith(bookmarkUrl);
  });

  it("tabOpen bookmark has not url", async () => {
    get.mockReturnValue([{ id: bookmarkId }]);
    const result = await actionGroup.tabOpen(bookmarkId);
    expect(result).toBeNull();
  });

  it("remove", async () => {
    await actionGroup.remove(bookmarkId);
    expect(remove).toHaveBeenCalledWith(bookmarkId);
  });

  it("remove bookmark has not url", async () => {
    get.mockReturnValue([{ id: bookmarkId }]);
    const result = await actionGroup.remove(bookmarkId);
    expect(result).toBeNull();
  });

  it("create", async () => {
    const title = "title";
    const parentId = "2";
    await actionGroup.create(bookmarkUrl, title, parentId);
    expect(create).toHaveBeenCalledWith({
      url: bookmarkUrl,
      title: title,
      parentId: parentId,
    });
  });

  it("getTree", async () => {
    await actionGroup.getTree(null);
  });

  it("getSubTree", async () => {
    await actionGroup.getTree(bookmarkId);
  });

  it("list", async () => {
    const limit = 10;
    await actionGroup.list(limit);
    expect(getRecent).toHaveBeenCalledWith(limit);
  });

  it("list use 50 when limit is null", async () => {
    await actionGroup.list();
    expect(getRecent).toHaveBeenCalledWith(50);
  });

  it("search", async () => {
    const query = "query";
    await actionGroup.search(query);
    expect(search).toHaveBeenCalledWith(query);
  });

  it("search return empty if query is null.", async () => {
    const result = await actionGroup.search();
    expect(result).toEqual([]);
  });

  it("update", async () => {
    const title = "title";
    await actionGroup.update(bookmarkId, bookmarkUrl, title);
    expect(update).toHaveBeenCalledWith(bookmarkId, {
      url: bookmarkUrl,
      title: title,
    });
  });
});

describe("BookmarkActionInvoker", () => {
  let list: jest.Mock;
  let search: jest.Mock;
  let update: jest.Mock;
  let create: jest.Mock;
  let getTree: jest.Mock;
  let open: jest.Mock;
  let tabOpen: jest.Mock;
  let remove: jest.Mock;
  let invoker: BookmarkActionInvoker;
  const id = "1";

  beforeEach(() => {
    list = jest.fn();
    search = jest.fn();
    update = jest.fn();
    create = jest.fn();
    getTree = jest.fn();
    open = jest.fn();
    tabOpen = jest.fn();
    remove = jest.fn();

    const ActionGroupClass = jest.fn<BookmarkActionGroup>(() => ({
      list: list,
      search: search,
      update: update,
      create: create,
      getTree: getTree,
      open: open,
      tabOpen: tabOpen,
      remove: remove,
    }));
    const actionGroup = new ActionGroupClass();

    invoker = new BookmarkActionInvoker(actionGroup);
  });

  it("list", () => {
    invoker.list({});
    expect(list).toHaveBeenCalledTimes(1);
  });

  it("search", () => {
    invoker.search({});
    expect(search).toHaveBeenCalledTimes(1);
  });

  it("update", () => {
    const url = "url";
    const title = "title";
    invoker.update({ id: id, url: url, title: title });
    expect(update).toHaveBeenCalledWith(id, url, title);
  });

  it("create", () => {
    const url = "url";
    const title = "title";
    const parentId = "1";
    invoker.create({ url: url, title: title, parentId: parentId });
    expect(create).toHaveBeenCalledWith(url, title, parentId);
  });

  it("getTree", () => {
    invoker.getTree({ id: id });
    expect(getTree).toHaveBeenCalledWith(id);
  });

  it("open", () => {
    invoker.open({ id: id });
    expect(open).toHaveBeenCalledWith(id);
  });

  it("tabOpen", () => {
    invoker.tabOpen({ id: id });
    expect(tabOpen).toHaveBeenCalledWith(id);
  });

  it("remove", () => {
    invoker.remove({ id: id });
    expect(remove).toHaveBeenCalledWith(id);
  });
});
