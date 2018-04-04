import { Client } from "./ctrlb/client";
import { Config } from "./ctrlb/config";

const config = new Config();

config.getHost().then(host => {
  const client = new Client(host);

  chrome.browserAction.onClicked.addListener(() => {
    if (!client.isOpen()) {
      config.getHost().then(host => {
        client.open(host);
      });
    }
  });
});
