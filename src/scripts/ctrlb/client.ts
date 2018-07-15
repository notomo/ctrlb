import { Result } from "./action/action";
import { ResultInfo } from "./action/action";

export class Client {
  protected socket: IWebSocket | null;
  protected readonly NAME: string = "ctrlb";
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

  protected sendMessage(data: any, requestId?: string) {
    data.client = this.NAME;
    if (requestId !== undefined) {
      data.requestId = requestId;
    }
    const json = JSON.stringify(data);
    const socket = this.socket as IWebSocket;
    socket.send(json);
  }

  protected onOpen() {
    this.view.setIcon({ path: this.ENABLE_ICON });
    this.sendMessage({});
  }

  protected disableIcon() {
    this.view.setIcon({ path: this.DISABLE_ICON });
  }

  protected onMessage(ev: MessageEvent) {
    const json = JSON.parse(ev.data);
    this.execute(json);
  }

  public execute(jsonArray: any): boolean {
    if (!this.isOpen()) {
      return false;
    }
    const requestId = jsonArray.requestId;
    this.invoker
      .execute(jsonArray)
      .then((result: Result) => this.sendMessage(result, requestId));
    return true;
  }
}

export interface View {
  setIcon(details: { path: string }): void;
}

export interface IWebSocket {
  onclose: ((ev: CloseEvent) => any) | null;
  onerror: ((ev: Event) => any) | null;
  onmessage: ((ev: MessageEvent) => any) | null;
  onopen: ((ev: Event) => any) | null;
  readonly readyState: number;
  close(code?: number, reason?: string): void;
  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
  readonly OPEN: number;
}

export class Connector {
  public connect(host: string): IWebSocket {
    return new WebSocket("ws://" + host);
  }
}

export interface ActionInvoker {
  execute(json: any): Promise<ResultInfo>;
}
