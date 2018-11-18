import { TabActionGroup } from "./tab";
import { Bookmarks } from "webextension-polyfill-ts";

interface BookmarkResult {
  id: string;
  url?: string;
  title: string;
  parentId?: string;
  isParent?: boolean;
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

    const results = nodes.map((book: Bookmarks.BookmarkTreeNode) => {
      return {
        id: book.id,
        url: book.url,
        title: book.title,
        parentId: book.parentId,
        isParent: false,
      };
    });

    if (parentNode !== null) {
      results.unshift({
        id: parentNode.id,
        url: parentNode.url,
        title: parentNode.title,
        parentId: parentNode.parentId,
        isParent: true,
      });
    }
    return results;
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
