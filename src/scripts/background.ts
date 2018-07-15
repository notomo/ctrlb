import { Client, Connector } from "./ctrlb/client";
import { Config } from "./ctrlb/config";
import ChromePromise from "chrome-promise";

const storage = new ChromePromise().storage.sync;
const config = new Config(storage);

config.getHost().then((host: string) => {
  const connector = new Connector();
  const view = chrome.browserAction;
  const client = new Client(connector, view);
  client.open(host);

  chrome.browserAction.onClicked.addListener(async () => {
    const host: string = await config.getHost();
    client.open(host);
  });

  chrome.tabs.onActivated.addListener((activeInfo: any) => {
    client.execute({
      actionName: "get",
      kindName: "tab",
      args: {
        id: activeInfo.tabId
      }
    });
  });
});
