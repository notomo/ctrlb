import { ActionFacade } from "./action/facade";
import { Result } from "./action/action";

export class Client {
  private host: string;
  private socket: WebSocket;
  private readonly NAME: string = "ctrlb";

  constructor(host: string) {
    this.host = host;
    this.socket = this.open(host);
  }

  protected open(host: string) {
    const socket = new WebSocket("ws://" + host);
    socket.onopen = () => this.onOpen();
    socket.onmessage = (ev: MessageEvent) => this.onMessage(ev);
    return socket;
  }

  public reload(host?: string) {
    if (host === undefined) {
      this.socket = this.open(this.host);
    } else {
      this.socket = this.open(host);
    }
  }

  public isOpen(): boolean {
    return this.socket.readyState === WebSocket.OPEN;
  }

  protected sendMessage(data: any, requestId?: string) {
    data.client = this.NAME;
    if (requestId !== undefined) {
      data.requestId = requestId;
    }
    const json = JSON.stringify(data);
    this.socket.send(json);
  }

  protected onOpen() {
    this.sendMessage({});
  }

  protected onMessage(ev: MessageEvent) {
    const json = JSON.parse(ev.data);
    this.execute(json);
  }

  public execute(jsonArray: any) {
    if (!this.isOpen()) {
      return;
    }
    const requestId = jsonArray.requestId;
    new ActionFacade()
      .execute(jsonArray)
      .then((result: Result) => this.sendMessage(result, requestId));
  }
}
