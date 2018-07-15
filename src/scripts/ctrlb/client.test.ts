import { Client, View, Connector, IWebSocket, ActionInvoker } from "./client";

describe("Client", () => {
  it("execute returns false if closed", () => {
    const ConnectorClass = jest.fn<Connector>(() => ({}));
    const connector = new ConnectorClass();
    const ViewClass = jest.fn<View>(() => ({}));
    const view = new ViewClass();
    const InvokerClass = jest.fn<ActionInvoker>(() => ({}));
    const invoker = new InvokerClass();
    const client = new Client(connector, view, invoker);

    expect(client.execute({})).toBe(false);
  });

  it("open sets event handlers", () => {
    const socket = new SocketMock();
    const send = jest.fn();
    socket.send = send;

    const ConnectorClass = jest.fn<Connector>(() => ({
      connect: jest.fn().mockReturnValue(socket)
    }));
    const connector = new ConnectorClass();

    const setIcon = jest.fn();
    const ViewClass = jest.fn<View>(() => ({
      setIcon: setIcon
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
    expect(send).toBeCalledWith('{"client":"ctrlb"}');
    expect(setIcon).toBeCalledWith({ path: client.ENABLE_ICON });

    // TODO: onmessage
  });
});

class SocketMock implements IWebSocket {
  onclose: ((ev: CloseEvent) => any) | null = null;
  onerror: ((ev: Event) => any) | null = null;
  onmessage = null;
  onopen: ((ev: Event) => any) | null = null;
  readonly OPEN: number = WebSocket.OPEN;
  readonly readyState: number = WebSocket.CONNECTING;
  close = (code?: number, reason?: string): void => {};
  send = (data: string | ArrayBufferLike | Blob | ArrayBufferView): void => {};
}
