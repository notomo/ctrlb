import { Client } from "./ctrlb/client";
import { Config } from "./ctrlb/config";

const config = new Config();

config.getHost().then(host => {
  const client = new Client(host);

  chrome.browserAction.onClicked.addListener(() => {
    if (!client.isOpen()) {
      config.getHost().then(host => {
        client.reload(host);
      });
    }
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
