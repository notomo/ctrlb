import { browser } from "webextension-polyfill-ts";
import { router } from "./ctrlb/route";
import { Di } from "./ctrlb/di";

const config = Di.get("Config");

config.getHost().then((host: string) => {
  const messageHandler = Di.get("MessageHandler", false, router);
  const client = Di.get("Client", false, messageHandler);
  client.open(host);

  browser.browserAction.onClicked.addListener(async () => {
    const host = await config.getHost();
    client.open(host);
  });

  Di.get("SubscribeEventHandler", true, client).listen();
});
