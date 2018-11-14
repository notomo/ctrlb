import { Client, Connector } from "./ctrlb/client";
import { Config } from "./ctrlb/config";
import { SubscribeEventHandler } from "./ctrlb/event";
import { ActionFacade } from "./ctrlb/action/invoker";
import { Button } from "./ctrlb/browserAction";
import { ResponseFactory } from "./ctrlb/response";
import { browser } from "webextension-polyfill-ts";

const storage = browser.storage.local;
const config = new Config(storage);

config.getHost().then((host: string) => {
  const connector = new Connector();
  const button = new Button(browser.browserAction);
  const invoker = new ActionFacade(browser);
  const responseFactory = new ResponseFactory();
  const client = new Client(connector, button, invoker, responseFactory);
  client.open(host);

  browser.browserAction.onClicked.addListener(async () => {
    const host: string = await config.getHost();
    client.open(host);
  });

  new SubscribeEventHandler(
    client,
    browser.storage.onChanged,
    browser.storage.local,
    browser.tabs.onActivated,
    browser.tabs.onUpdated,
    browser.tabs.onCreated,
    browser.tabs.onRemoved,
    browser.tabs.onZoomChange,
    browser.history.onVisited,
    browser.history.onVisitRemoved,
    browser.history.onTitleChanged,
    browser.windows.onFocusChanged,
    browser.windows.onCreated,
    browser.windows.onRemoved,
    browser.bookmarks.onCreated,
    browser.bookmarks.onRemoved,
    browser.bookmarks.onChanged,
    browser.downloads.onCreated
  ).listen();
});
