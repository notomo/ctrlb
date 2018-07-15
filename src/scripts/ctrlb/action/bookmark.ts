import { ActionArgs, ActionKind, ActionGroup, ResultInfo } from "./action";
import { TabKind } from "./tab";
import { BookmarkItem } from "./facade";

export class BookmarkKind extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      list: (args: ActionArgs) => this.list(args),
      open: (args: ActionArgs) => this.open(args),
      tabOpen: (args: ActionArgs) => this.tabOpen(args),
      search: (args: ActionArgs) => this.search(args),
      update: (args: ActionArgs) => this.update(args),
      remove: (args: ActionArgs) => this.remove(args),
      create: (args: ActionArgs) => this.create(args)
    };
  }

  private async get(bookmarkId: number): Promise<BookmarkItem> {
    const id = String(bookmarkId);
    return await this.browser.bookmarks
      .get(id)
      .then((bookmarks: BookmarkItem[]) => {
        const bookmark = bookmarks.pop();
        if (bookmark === undefined) {
          throw new NotFoundBookmark(id);
        }
        return bookmark;
      });
  }

  protected async open(args: ActionArgs): Promise<ResultInfo> {
    if (args.id === undefined) {
      return { status: "invalid" };
    }
    return await this.get(args.id as number).then((bookmark: BookmarkItem) => {
      if (bookmark.url === undefined) {
        return { status: "invalid" };
      }
      return new TabKind(this.browser).execute("open", { url: bookmark.url });
    });
  }

  protected async tabOpen(args: ActionArgs): Promise<ResultInfo> {
    if (args.id === undefined) {
      return { status: "invalid" };
    }
    return await this.get(args.id as number).then((bookmark: BookmarkItem) => {
      if (bookmark.url === undefined) {
        return { status: "invalid" };
      }
      return new TabKind(this.browser).execute("tabOpen", {
        url: bookmark.url
      });
    });
  }

  protected async remove(args: ActionArgs): Promise<ResultInfo> {
    if (args.id === undefined) {
      return { status: "invalid" };
    }
    const bookmark = await this.get(args.id as number);
    if (bookmark.url === undefined) {
      return this.browser.bookmarks.removeTree(bookmark.id).then(() => {
        return { status: "ok" };
      });
    }
    return this.browser.bookmarks.remove(bookmark.id).then(() => {
      return { status: "ok" };
    });
  }

  protected async create(args: ActionArgs): Promise<ResultInfo> {
    const info = {
      url: args.url as string,
      title: args.title as string,
      parentId: args.parentId as string
    };
    return this.browser.bookmarks
      .create(info)
      .then((bookmark: BookmarkItem) => {
        return { status: "ok" };
      });
  }

  protected async list(args: ActionArgs): Promise<ResultInfo> {
    let numberOfItems: number;
    if (args.limit !== undefined) {
      numberOfItems = args.limit as number;
    } else {
      numberOfItems = 50;
    }
    const bookmarks = await this.browser.bookmarks
      .getRecent(numberOfItems)
      .then((bookmarks: BookmarkItem[]) => {
        const body = bookmarks.map(book => {
          return {
            id: book.id,
            url: book.url,
            title: book.title
          };
        });

        return { status: "ok", body: body };
      });
    return bookmarks;
  }

  protected async search(args: ActionArgs): Promise<ResultInfo> {
    const query: string = args.input as string;
    if (query === undefined) {
      return { status: "ok", body: [] };
    }
    return await this.browser.bookmarks
      .search(query)
      .then((bookmarks: BookmarkItem[]) => {
        const body = bookmarks.map(book => {
          return {
            id: book.id,
            url: book.url,
            title: book.title
          };
        });

        return { status: "ok", body: body };
      });
  }

  protected async update(args: ActionArgs): Promise<ResultInfo> {
    if (args.id === undefined) {
      return { status: "invalid" };
    }
    const id = args.id as number;
    const info = {
      url: args.url as string,
      title: args.title as string
    };
    return this.get(id).then((bookmark: BookmarkItem) => {
      this.browser.bookmarks.update(bookmark.id, info);
      return { status: "ok" };
    });
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
