import { ActionArgs, ActionKind, ActionGroup, ResultInfo } from "./action";
import { TabKind } from "./tab";
import { BookmarkItem } from "./facade";

export class BookmarkKind extends ActionKind {
  protected getActions(): ActionGroup {
    return {
      list: {
        f: (args: ActionArgs) =>
          this.list(this.has({ limit: this.optionalNumber }, args).limit)
      },
      open: { f: (args: ActionArgs) => this.open(this.hasId(args)) },
      tabOpen: { f: (args: ActionArgs) => this.tabOpen(this.hasId(args)) },
      search: {
        f: (args: ActionArgs) =>
          this.search(this.has({ input: this.optionalString }, args).input)
      },
      update: {
        f: (args: ActionArgs) => {
          const a = this.has(
            {
              id: this.requiredNumber,
              url: this.requiredString,
              title: this.requiredString
            },
            args
          );
          return this.update(a.id, a.url, a.title);
        }
      },
      remove: { f: (args: ActionArgs) => this.remove(this.hasId(args)) },
      create: {
        f: (args: ActionArgs) => {
          const a = this.has(
            {
              url: this.requiredString,
              title: this.requiredString,
              parentId: this.requiredString
            },
            args
          );
          return this.create(a.url, a.title, a.parentId);
        }
      }
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

  protected async open(id: number): Promise<ResultInfo> {
    return await this.get(id).then(async (bookmark: BookmarkItem) => {
      if (bookmark.url === undefined) {
        return {};
      }
      const result = (await new TabKind(this.browser).execute("open", {
        url: bookmark.url
      })) as ResultInfo; // TODO: remove as ResultInfo;
      if (result === undefined) {
        return {};
      }
      return result;
    });
  }

  protected async tabOpen(id: number): Promise<ResultInfo> {
    return await this.get(id).then(async (bookmark: BookmarkItem) => {
      if (bookmark.url === undefined) {
        return {};
      }
      const result = (await new TabKind(this.browser).execute("tabOpen", {
        url: bookmark.url
      })) as ResultInfo; // TODO: remove as ResultInfo;
      if (result === undefined) {
        return {};
      }
      return result;
    });
  }

  protected async remove(id: number): Promise<null> {
    const bookmark = await this.get(id);
    if (bookmark.url === undefined) {
      await this.browser.bookmarks.removeTree(bookmark.id);
      return null;
    }
    this.browser.bookmarks.remove(bookmark.id);
    return null;
  }

  protected async create(
    url: string,
    title: string,
    parentId: string
  ): Promise<null> {
    const info = {
      url: url,
      title: title,
      parentId: parentId
    };
    this.browser.bookmarks.create(info);
    return null;
  }

  protected async list(limit?: number): Promise<ResultInfo> {
    const numberOfItems = limit || 50;
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

        return { body: body };
      });
    return bookmarks;
  }

  protected async search(query?: string): Promise<ResultInfo> {
    if (query === undefined) {
      return { body: [] };
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

        return { body: body };
      });
  }

  protected async update(
    id: number,
    url: string,
    title: string
  ): Promise<null> {
    const info = {
      url: url,
      title: title
    };
    const bookmark = await this.get(id);
    this.browser.bookmarks.update(bookmark.id, info);
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
