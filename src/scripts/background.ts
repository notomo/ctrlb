import { Client, Connector } from "./ctrlb/client";
import { Config } from "./ctrlb/config";
import { SubscribeEventHandler } from "./ctrlb/event";
import { ActionFacade } from "./ctrlb/action/invoker";
import { browser } from "webextension-polyfill-ts";

const storage = browser.storage.sync;
const config = new Config(storage);

config.getHost().then((host: string) => {
  const connector = new Connector();
  const view = browser.browserAction;
  const invoker = new ActionFacade(browser);
  const client = new Client(connector, view, invoker);
  client.open(host);

  browser.browserAction.onClicked.addListener(async () => {
    const host: string = await config.getHost();
    client.open(host);
  });

  new SubscribeEventHandler(
    client,
    browser.storage.onChanged,
    browser.storage.sync,
    browser.tabs.onActivated,
    browser.tabs.onUpdated
  ).listen();
});
