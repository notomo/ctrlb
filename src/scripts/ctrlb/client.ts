import { ActionArgs } from "./action/action";
import { EventType } from "./event";
import { Button } from "./browserAction";
import { ResponseFactory } from "./response";

export class Client {
  protected socket: WebSocket | null;

  constructor(
    protected readonly connector: Connector,
    protected readonly button: Button,
    protected readonly invoker: ActionInvoker,
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
    const json = JSON.parse(ev.data);
    const result = await this.invoker.execute(
      json.actionGroupName || "",
      json.actionName || "",
      json.args || {}
    );

    this.sendMessage(
      this.responseFactory.create(result, json.requestId).toJson()
    );
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
    actionGroupName: string,
    actionName: string,
    eventName: EventType,
    args?: ActionArgs
  ): Promise<boolean> {
    if (!this.isOpen()) {
      return false;
    }

    const result = await this.invoker.execute(
      actionGroupName,
      actionName,
      args
    );

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

export interface ActionInvoker {
  execute(
    actionGroupName: string,
    actionName: string,
    args?: ActionArgs
  ): Promise<{}>;
}
