import { BookmarkActionGroup, NotFoundBookmark } from "./bookmark";
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

    const BookmarkTreeNodeClass: jest.Mock<
      Bookmarks.BookmarkTreeNode
    > = jest.fn(() => ({
      parentId: "2",
      children: [],
    })) as any;
    const bookmarkTreeNode = new BookmarkTreeNodeClass();

    getTree = jest.fn().mockReturnValue([bookmarkTreeNode]);
    getSubTree = jest.fn().mockReturnValue([bookmarkTreeNode]);

    const BookmarksClass: jest.Mock<Bookmarks.Static> = jest.fn(() => ({
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
    })) as any;
    const bookmarks = new BookmarksClass();

    const TabActionGroupClass: jest.Mock<TabActionGroup> = jest.fn(() => ({
      open: tabGroupOpen,
      tabOpen: tabGroupTabOpen,
    })) as any;
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
