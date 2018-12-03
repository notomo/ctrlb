import { Client } from "./client";
import { SubscribeEventHandler } from "./event";

describe("SubscribeEventHandler", () => {
  it("listen", async () => {
    const ClientClass = jest.fn<Client>(() => ({}));
    const client = new ClientClass();

    const onActivated = {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    };

    new SubscribeEventHandler(
      client,
      onActivated,
      onActivated,
      onActivated,
      onActivated,
      onActivated,
      onActivated,
      onActivated,
      onActivated,
      onActivated,
      onActivated,
      onActivated,
      onActivated,
      onActivated,
      onActivated,
      onActivated
    ).listen();
  });
});
