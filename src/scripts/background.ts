import { Client, Connector } from "./ctrlb/client";
import { Config } from "./ctrlb/config";
import { SubscribeEventHandler } from "./ctrlb/event";
import { Button } from "./ctrlb/browserAction";
import { RequestFactory } from "./ctrlb/request";
import { NotificationFactory } from "./ctrlb/notification";
import { ResponseFactory } from "./ctrlb/response";
import { browser } from "webextension-polyfill-ts";
import { router } from "./ctrlb/route";

const storage = browser.storage.local;
const config = new Config(storage);

config.getHost().then((host: string) => {
  const connector = new Connector();
  const button = new Button(browser.browserAction);
  const requestFactory = new RequestFactory();
  const notificationFactory = new NotificationFactory();
  const responseFactory = new ResponseFactory();
  const client = new Client(
    connector,
    button,
    router,
    requestFactory,
    notificationFactory,
    responseFactory
  );
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
