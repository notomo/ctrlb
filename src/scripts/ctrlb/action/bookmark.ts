import { ActionArgs, ResultInfo, Action, ActionInvoker } from "./action";
import { TabActionGroup } from "./tab";
import { Validator } from "./validator";
import { Bookmarks } from "webextension-polyfill-ts";

export class BookmarkActionGroup {
  constructor(
    protected readonly tabActionGroup: TabActionGroup,
    protected readonly bookmarks: Bookmarks.Static
  ) {}

  protected async get(bookmarkId: number): Promise<Bookmarks.BookmarkTreeNode> {
    const id = String(bookmarkId);
    const bookmarks = await this.bookmarks.get(id);
    const bookmark = bookmarks.pop();
    if (bookmark === undefined) {
      throw new NotFoundBookmark(id);
    }
    return bookmark;
  }

  public async open(id: number): Promise<ResultInfo | null> {
    const bookmark = await this.get(id);

    if (bookmark.url === undefined) {
      return {};
    }

    return this.tabActionGroup.open(bookmark.url);
  }

  public async tabOpen(id: number): Promise<ResultInfo | null> {
    const bookmark = await this.get(id);

    if (bookmark.url === undefined) {
      return {};
    }

    return this.tabActionGroup.tabOpen(bookmark.url);
  }

  public async remove(id: number): Promise<null> {
    const bookmark = await this.get(id);
    if (bookmark.url === undefined) {
      await this.bookmarks.removeTree(bookmark.id);
      return null;
    }
    this.bookmarks.remove(bookmark.id);
    return null;
  }

  public async create(
    url: string,
    title: string,
    parentId: string
  ): Promise<null> {
    const info = {
      url: url,
      title: title,
      parentId: parentId
    };
    this.bookmarks.create(info);
    return null;
  }

  public async list(limit: number | null = null): Promise<ResultInfo> {
    const numberOfItems = limit || 50;
    const bookmarks = await this.bookmarks.getRecent(numberOfItems);
    const body = bookmarks.map(book => {
      return {
        id: book.id,
        url: book.url,
        title: book.title
      };
    });

    return { body: body };
  }

  public async search(query: string | null = null): Promise<ResultInfo> {
    if (query === null) {
      return { body: [] };
    }

    const bookmarks = await this.bookmarks.search(query);
    const body = bookmarks.map(book => {
      return {
        id: book.id,
        url: book.url,
        title: book.title
      };
    });

    return { body: body };
  }

  public async update(id: number, url: string, title: string): Promise<null> {
    const info = {
      url: url,
      title: title
    };
    const bookmark = await this.get(id);
    this.bookmarks.update(bookmark.id, info);
    return null;
  }
}

class NotFoundBookmark extends Error {
  constructor(private id: string) {
    super();
  }

  toString() {
    return "Not found bookmark: " + this.id;
  }
}

export class BookmarkActionInvoker extends ActionInvoker<BookmarkActionGroup> {
  public readonly list: Action;
  public readonly search: Action;
  public readonly update: Action;
  public readonly create: Action;
  public readonly open: Action;
  public readonly tabOpen: Action;
  public readonly remove: Action;

  constructor(
    actionGroup: BookmarkActionGroup,
    v: Validator<BookmarkActionGroup>
  ) {
    super(actionGroup, v);

    this.list = (args: ActionArgs) => {
      const a = v.has({ limit: v.optionalNumber() }, args);
      return actionGroup.list(a.limit);
    };

    this.search = (args: ActionArgs) => {
      const a = v.has({ input: v.optionalString() }, args);
      return actionGroup.search(a.input);
    };

    this.update = (args: ActionArgs) => {
      const a = v.has(
        {
          id: v.requiredNumber(),
          url: v.requiredString(),
          title: v.requiredString()
        },
        args
      );
      return actionGroup.update(a.id, a.url, a.title);
    };

    this.create = (args: ActionArgs) => {
      const a = v.has(
        {
          url: v.requiredString(),
          title: v.requiredString(),
          parentId: v.requiredString()
        },
        args
      );
      return actionGroup.create(a.url, a.title, a.parentId);
    };

    const idArgsActions = {
      open: actionGroup.open,
      tabOpen: actionGroup.tabOpen,
      remove: actionGroup.remove
    };

    this.open = this.idArgsAction(idArgsActions, "open");
    this.tabOpen = this.idArgsAction(idArgsActions, "tabOpen");
    this.remove = this.idArgsAction(idArgsActions, "remove");
  }
}
