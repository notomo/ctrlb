import { Client, Connector } from "./client";
import { Button } from "./browserAction";
import { EventType } from "./event";
import { Router } from "./router";
import { ResponseFactory, Response } from "./response";
import { NotificationFactory } from "./notification";
import { RequestFactory } from "./request";

describe("Client", () => {
  it("notify returns false if closed", async () => {
    const ConnectorClass = jest.fn<Connector>(() => ({}));
    const connector = new ConnectorClass();
    const ButtonClass = jest.fn<Button>(() => ({}));
    const button = new ButtonClass();

    const RouterClass = jest.fn<Router>(() => ({}));
    const router = new RouterClass();

    const RequestFactoryClass = jest.fn<RequestFactory>(() => ({}));
    const requestFactory = new RequestFactoryClass();

    const NotificationFactoryClass = jest.fn<NotificationFactory>(() => ({}));
    const notificationFactory = new NotificationFactoryClass();

    const ResponseFactoryClass = jest.fn<ResponseFactory>(() => ({}));
    const responseFactory = new ResponseFactoryClass();

    const client = new Client(
      connector,
      button,
      router,
      requestFactory,
      notificationFactory,
      responseFactory
    );

    expect(await client.notify("", EventType.tabActivated)).toBe(false);
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

    const enable = jest.fn();
    const disable = jest.fn();
    const ButtonClass = jest.fn<Button>(() => ({
      enable: enable,
      disable: disable,
    }));
    const button = new ButtonClass();

    const RouterClass = jest.fn<Router>(() => ({}));
    const router = new RouterClass();

    const RequestFactoryClass = jest.fn<RequestFactory>(() => ({}));
    const requestFactory = new RequestFactoryClass();

    const NotificationFactoryClass = jest.fn<NotificationFactory>(() => ({}));
    const notificationFactory = new NotificationFactoryClass();

    const responseJson = "{}";
    const toJson = jest.fn().mockReturnValue(responseJson);
    const ResponseClass = jest.fn<Response>(() => ({
      toJson: toJson,
    }));
    const response = new ResponseClass();

    const create = jest.fn().mockReturnValue(response);
    const ResponseFactoryClass = jest.fn<ResponseFactory>(() => ({
      create: create,
    }));
    const responseFactory = new ResponseFactoryClass();

    const client = new Client(
      connector,
      button,
      router,
      requestFactory,
      notificationFactory,
      responseFactory
    );

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
    expect(disable).toBeCalledWith();
    expect(disable).toHaveBeenCalledTimes(1);

    const errorEvent = new Event("error");
    socket.onerror(errorEvent);
    expect(disable).toHaveBeenCalledTimes(2);

    const openEvent = new Event("open");
    socket.onopen(openEvent);
    expect(send).toBeCalledWith(responseJson);
    expect(enable).toBeCalledWith();

    // TODO: onmessage
  });
});
