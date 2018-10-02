import { ActionArgs } from "./action/action";
import { EventType } from "./event";

export class Client {
  protected socket: WebSocket | null;
  protected readonly connector: Connector;
  protected readonly view: View;
  protected readonly invoker: ActionInvoker;
  public readonly ENABLE_ICON = "images/icon-19.png";
  public readonly DISABLE_ICON = "images/icon-19-gray.png";

  constructor(connector: Connector, view: View, invoker: ActionInvoker) {
    this.socket = null;
    this.connector = connector;
    this.view = view;
    this.invoker = invoker;
  }

  public open(host: string) {
    if (this.isOpen()) {
      return;
    }
    const socket = this.connector.connect(host);
    socket.onopen = (ev: Event) => this.onOpen();
    socket.onmessage = (ev: MessageEvent) => this.onMessage(ev);
    socket.onerror = (ev: Event) => this.disableIcon();
    socket.onclose = (ev: CloseEvent) => this.disableIcon();
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
    this.view.setIcon({ path: this.ENABLE_ICON });
    this.sendMessage({}, {});
  }

  protected disableIcon() {
    this.view.setIcon({ path: this.DISABLE_ICON });
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

export interface View {
  setIcon(details: { path: string }): void;
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
