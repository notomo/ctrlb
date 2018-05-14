import { Client } from "./ctrlb/client";
import { Config } from "./ctrlb/config";

const config = new Config();

config.getHost().then((host: string) => {
  const client = new Client(host);

  chrome.browserAction.onClicked.addListener(async () => {
    if (client.isOpen()) {
      return;
    }
    const host: string = await config.getHost();
    client.reload(host);
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
