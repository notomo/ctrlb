import { ActionArgs } from "./action/action";
import { EventType } from "./event";
import { Button } from "./browserAction";

export class Client {
  protected socket: WebSocket | null;

  constructor(
    protected readonly connector: Connector,
    protected readonly button: Button,
    protected readonly invoker: ActionInvoker
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

  protected sendMessage(
    data: {},
    option: ResponseOption,
    requestId?: string | undefined
  ) {
    const json = JSON.stringify(new Response(data, option, requestId));
    const socket = this.socket as WebSocket;
    socket.send(json);
  }

  protected onOpen() {
    this.button.enable();
    this.sendMessage({}, {});
  }

  protected async onMessage(ev: MessageEvent) {
    const json = JSON.parse(ev.data);
    const result = await this.invoker.execute(
      json.actionGroupName || "",
      json.actionName || "",
      json.args || {}
    );
    this.sendMessage(result, {}, json.requestId);
  }

  public async notifyWithData(
    data: {},
    eventName: EventType
  ): Promise<boolean> {
    if (!this.isOpen()) {
      return false;
    }
    this.sendMessage(data, { eventName: eventName });
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
    this.sendMessage(result, { eventName: eventName });
    return true;
  }
}

type ResponseOption = {
  eventName?: EventType | undefined;
};

class Response {
  public readonly client = "ctrlb";
  public readonly requestId?: string;
  public readonly body: {};
  public readonly option: ResponseOption;

  constructor(
    body: {},
    option: ResponseOption,
    requestId?: string | undefined
  ) {
    this.body = body;
    this.option = {};
    if (requestId !== undefined) {
      this.requestId = requestId;
    }
    if (option !== undefined && option.eventName !== undefined) {
      this.option.eventName = option.eventName;
    }
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
