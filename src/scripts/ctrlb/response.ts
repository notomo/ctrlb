import { EventType } from "./event";

export class Response {
  constructor(
    protected readonly data: {},
    protected readonly requestId?: string
  ) {}

  public toJson(): string {
    return JSON.stringify({
      body: { data: this.data },
      requestId: this.requestId,
    });
  }

  public toJsonWithEventType(eventName: EventType): string {
    const body = {
      data: this.data,
      requestId: this.requestId,
      eventName: eventName,
    };
    return JSON.stringify({ body: body, requestId: this.requestId });
  }
}

export class ResponseFactory {
  public create(body: {}, requestId?: string) {
    return new Response(body, requestId);
  }
}
