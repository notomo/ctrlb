import { ActionArgs, Action, ActionInvoker } from "./action";
import { TabActionGroup } from "./tab";
import { Bookmarks } from "webextension-polyfill-ts";

interface BookmarkResult {
  id: string;
  url?: string;
  title: string;
  parentId?: string;
}

export class BookmarkActionGroup {
  constructor(
    protected readonly tabActionGroup: TabActionGroup,
    protected readonly bookmarks: Bookmarks.Static
  ) {}

  protected async get(bookmarkId: string): Promise<Bookmarks.BookmarkTreeNode> {
    const bookmarks = await this.bookmarks.get(bookmarkId);
    const bookmark = bookmarks.pop();
    if (bookmark === undefined) {
      throw new NotFoundBookmark(bookmarkId);
    }
    return bookmark;
  }

  public async getTree(bookmarkId: string | null): Promise<BookmarkResult[]> {
    let tree;
    let parentNode = null;
    if (bookmarkId === null) {
      tree = await this.bookmarks.getTree();
    } else {
      tree = await this.bookmarks.getSubTree(bookmarkId);
      const parentId = tree[0].parentId;
      if (parentId !== undefined) {
        parentNode = await this.get(parentId);
      }
    }
    const nodes = tree[0].children;
    if (nodes === undefined) {
      return [];
    }
    if (parentNode !== null) {
      nodes.unshift(parentNode);
    }

    return nodes.map((book: Bookmarks.BookmarkTreeNode) => {
      return {
        id: book.id,
        url: book.url,
        title: book.title,
        parentId: book.parentId,
      };
    });
  }

  public async open(id: string): Promise<null> {
    const bookmark = await this.get(id);

    if (bookmark.url === undefined) {
      return null;
    }

    return this.tabActionGroup.open(bookmark.url);
  }

  public async tabOpen(id: string): Promise<null> {
    const bookmark = await this.get(id);

    if (bookmark.url === undefined) {
      return null;
    }

    return this.tabActionGroup.tabOpen(bookmark.url);
  }

  public async remove(id: string): Promise<null> {
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
      parentId: parentId,
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
        title: book.title,
        parentId: book.parentId,
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
        title: book.title,
        parentId: book.parentId,
      };
    });
  }

  public async update(id: string, url: string, title: string): Promise<null> {
    const info = {
      url: url,
      title: title,
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
  public readonly getTree: Action;

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
          id: this.v.requiredString(),
          url: this.v.requiredString(),
          title: this.v.requiredString(),
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
          parentId: this.v.requiredString(),
        },
        args
      );
      return actionGroup.create(a.url, a.title, a.parentId);
    };

    this.getTree = (args: ActionArgs) => {
      const a = this.v.has({ id: this.v.optionalString() }, args);
      return actionGroup.getTree(a.id);
    };

    this.open = (args: ActionArgs) => {
      const a = this.v.has({ id: this.v.requiredString() }, args);
      return actionGroup.open(a.id);
    };

    this.tabOpen = (args: ActionArgs) => {
      const a = this.v.has({ id: this.v.requiredString() }, args);
      return actionGroup.tabOpen(a.id);
    };

    this.remove = (args: ActionArgs) => {
      const a = this.v.has({ id: this.v.requiredString() }, args);
      return actionGroup.remove(a.id);
    };
  }
}
