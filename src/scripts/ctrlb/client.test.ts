import { Client, View, Connector, ActionInvoker } from "./client";
import { EventType } from "./event";

describe("Client", () => {
  it("notify returns false if closed", async () => {
    const ConnectorClass = jest.fn<Connector>(() => ({}));
    const connector = new ConnectorClass();
    const ViewClass = jest.fn<View>(() => ({}));
    const view = new ViewClass();
    const InvokerClass = jest.fn<ActionInvoker>(() => ({}));
    const invoker = new InvokerClass();
    const client = new Client(connector, view, invoker);

    expect(await client.notify("", "", EventType.tabActivated)).toBe(false);
  });

  it("open sets event handlers", () => {
    const send = jest.fn();
    const WebSocketClass = jest.fn<WebSocket>(() => ({
      send: send,
    }));
    const socket = new WebSocketClass();

    const ConnectorClass = jest.fn<Connector>(() => ({
      connect: jest.fn().mockReturnValue(socket),
    }));
    const connector = new ConnectorClass();

    const setIcon = jest.fn();
    const ViewClass = jest.fn<View>(() => ({
      setIcon: setIcon,
    }));
    const view = new ViewClass();
    const InvokerClass = jest.fn<ActionInvoker>(() => ({}));
    const invoker = new InvokerClass();
    const client = new Client(connector, view, invoker);

    client.open("dummyhost");
    expect(socket.onclose).not.toBeNull();
    expect(socket.onerror).not.toBeNull();
    expect(socket.onmessage).not.toBeNull();
    expect(socket.onopen).not.toBeNull();

    // guard
    if (
      socket.onclose == null ||
      socket.onerror == null ||
      socket.onopen == null
    ) {
      return;
    }

    const closeEvent = new CloseEvent("close");
    socket.onclose(closeEvent);
    expect(setIcon).toBeCalledWith({ path: client.DISABLE_ICON });
    expect(setIcon).toHaveBeenCalledTimes(1);

    const errorEvent = new Event("error");
    socket.onerror(errorEvent);
    expect(setIcon).toHaveBeenCalledTimes(2);

    const openEvent = new Event("open");
    socket.onopen(openEvent);
    expect(send).toBeCalledWith('{"client":"ctrlb","body":{},"option":{}}');
    expect(setIcon).toBeCalledWith({ path: client.ENABLE_ICON });

    // TODO: onmessage
  });
});
