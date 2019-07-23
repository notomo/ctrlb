import { EventType } from "./event";
import { Button } from "./browserAction";
import { MessageHandler } from "./handler";

export class Client {
  protected socket: WebSocket | null;

  constructor(
    protected readonly connector: Connector,
    protected readonly button: Button,
    protected readonly messageHandler: MessageHandler
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
    const response = this.messageHandler.handleNotifyWithData({});
    this.sendMessage(response.toJson());
  }

  protected async onMessage(ev: MessageEvent) {
    const [
      response,
      errResponse,
      isNotification,
    ] = await this.messageHandler.handle(ev.data);
    if (isNotification && errResponse !== null) {
      const responseJson = errResponse.toJson();
      console.error(responseJson);
      return;
    } else if (errResponse !== null) {
      const responseJson = errResponse.toJson();
      console.error(responseJson);
      this.sendMessage(responseJson);
      return;
    } else if (response === null) {
      return;
    }

    this.sendMessage(response.toJson());
  }

  public async notifyWithData(
    data: {},
    eventName: EventType
  ): Promise<boolean> {
    if (!this.isOpen()) {
      return false;
    }

    const response = this.messageHandler.handleNotifyWithData(data);
    this.sendMessage(response.toJsonWithEventType(eventName));
    return true;
  }

  public async notify(
    method: string,
    eventName: EventType,
    params?: { [index: string]: any }
  ): Promise<boolean> {
    if (!this.isOpen()) {
      return false;
    }

    const [response, errResponse] = await this.messageHandler.handleNotify(
      method,
      params
    );

    if (errResponse !== null) {
      const responseJson = errResponse.toJson();
      console.error(responseJson);
      return false;
    }

    if (response === null) {
      return false;
    }

    this.sendMessage(response.toJsonWithEventType(eventName));
    return true;
  }
}

export class Connector {
  public connect(host: string): WebSocket {
    return new WebSocket("ws://" + host);
  }
}
