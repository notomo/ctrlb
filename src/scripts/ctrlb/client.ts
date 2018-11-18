import { EventType } from "./event";
import { Button } from "./browserAction";
import { RequestFactory } from "./request";
import { NotificationFactory } from "./notification";
import { ResponseFactory } from "./response";
import { Router } from "./router";

export class Client {
  protected socket: WebSocket | null;

  constructor(
    protected readonly connector: Connector,
    protected readonly button: Button,
    protected readonly router: Router,
    protected readonly requestFactory: RequestFactory,
    protected readonly notificationFactory: NotificationFactory,
    protected readonly responseFactory: ResponseFactory
  ) {
    this.socket = null;
  }

  public open(host: string) {
    if (this.isOpen()) {
      return;
    }
    const socket = this.connector.connect(host);
    socket.onopen = (ev: Event) => this.onOpen();
    socket.onmessage = (ev: MessageEvent) => this.onMessage(ev);
    socket.onerror = (ev: Event) => this.button.disable();
    socket.onclose = (ev: CloseEvent) => this.button.disable();
    this.socket = socket;
  }

  protected isOpen(): boolean {
    if (this.socket == null) {
      return false;
    }
    return this.socket.readyState === this.socket.OPEN;
  }

  protected sendMessage(json: string) {
    const socket = this.socket as WebSocket;
    socket.send(json);
  }

  protected onOpen() {
    this.button.enable();
    this.sendMessage(this.responseFactory.create({}).toJson());
  }

  protected async onMessage(ev: MessageEvent) {
    const request = this.requestFactory.createFromJson(ev.data);
    const result = await this.router.match(request);

    this.sendMessage(this.responseFactory.create(result, request.id).toJson());
  }

  public async notifyWithData(
    data: {},
    eventName: EventType
  ): Promise<boolean> {
    if (!this.isOpen()) {
      return false;
    }

    this.sendMessage(
      this.responseFactory.create(data).toJsonWithEventType(eventName)
    );
    return true;
  }

  public async notify(
    method: string,
    eventName: EventType,
    args?: { [index: string]: any }
  ): Promise<boolean> {
    if (!this.isOpen()) {
      return false;
    }

    const notification = this.notificationFactory.create(method, args);
    const result = await this.router.match(notification);

    this.sendMessage(
      this.responseFactory.create(result).toJsonWithEventType(eventName)
    );
    return true;
  }
}

export class Connector {
  public connect(host: string): WebSocket {
    return new WebSocket("ws://" + host);
  }
}
