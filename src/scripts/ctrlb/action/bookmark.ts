import { ActionArgs, Action, ActionInvoker } from "./action";
import { TabActionGroup } from "./tab";
import { Bookmarks } from "webextension-polyfill-ts";

interface BookmarkResult {
  id: string;
  url?: string;
  title: string;
}

export class BookmarkActionGroup {
  constructor(
    protected readonly tabActionGroup: TabActionGroup,
    protected readonly bookmarks: Bookmarks.Static
  ) {}

  protected async get(
    bookmarkId: number | string
  ): Promise<Bookmarks.BookmarkTreeNode> {
    const id = String(bookmarkId);
    const bookmarks = await this.bookmarks.get(id);
    const bookmark = bookmarks.pop();
    if (bookmark === undefined) {
      throw new NotFoundBookmark(id);
    }
    return bookmark;
  }

  public async open(id: number): Promise<null> {
    const bookmark = await this.get(id);

    if (bookmark.url === undefined) {
      return null;
    }

    return this.tabActionGroup.open(bookmark.url);
  }

  public async tabOpen(id: number): Promise<null> {
    const bookmark = await this.get(id);

    if (bookmark.url === undefined) {
      return null;
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

  public async list(limit: number | null = null): Promise<BookmarkResult[]> {
    const numberOfItems = limit || 50;
    const bookmarks = await this.bookmarks.getRecent(numberOfItems);
    return bookmarks.map(book => {
      return {
        id: book.id,
        url: book.url,
        title: book.title
      };
    });
  }

  public async search(query: string | null = null): Promise<BookmarkResult[]> {
    if (query === null) {
      return [];
    }

    const bookmarks = await this.bookmarks.search(query);
    return bookmarks.map(book => {
      return {
        id: book.id,
        url: book.url,
        title: book.title
      };
    });
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

export class NotFoundBookmark extends Error {
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

  constructor(actionGroup: BookmarkActionGroup) {
    super(actionGroup);

    this.list = (args: ActionArgs) => {
      const a = this.v.has({ limit: this.v.optionalNumber() }, args);
      return actionGroup.list(a.limit);
    };

    this.search = (args: ActionArgs) => {
      const a = this.v.has({ input: this.v.optionalString() }, args);
      return actionGroup.search(a.input);
    };

    this.update = (args: ActionArgs) => {
      const a = this.v.has(
        {
          id: this.v.requiredNumber(),
          url: this.v.requiredString(),
          title: this.v.requiredString()
        },
        args
      );
      return actionGroup.update(a.id, a.url, a.title);
    };

    this.create = (args: ActionArgs) => {
      const a = this.v.has(
        {
          url: this.v.requiredString(),
          title: this.v.requiredString(),
          parentId: this.v.requiredString()
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
