import { EventType } from "./event";
import {
  ApplicationError,
  MethodNotFound,
  ServerError,
  InvalidRequest,
} from "./error";

export class Response {
  constructor(
    protected readonly data: {},
    protected readonly requestId?: string
  ) {}

  public toJson(): string {
    return JSON.stringify({
      body: { data: this.data },
      id: this.requestId,
    });
  }

  public toJsonWithEventType(eventName: EventType): string {
    const body = {
      data: this.data,
      requestId: this.requestId,
      eventName: eventName,
    };
    return JSON.stringify({ body: body, id: this.requestId });
  }
}

export class ErrorResponse {
  constructor(
    protected readonly error: ApplicationError,
    protected readonly requestId?: string
  ) {}

  public toJson(): string {
    return JSON.stringify({
      error: {
        code: this.error.code,
        message: this.error.toString(),
        data: { name: this.error.name, stack: this.error.stack },
      },
      id: this.requestId,
    });
  }
}

export class ResponseFactory {
  public create(body: {}, requestId?: string): Response {
    return new Response(body, requestId);
  }

  public createError(e: any, requestId?: string): ErrorResponse {
    if (e instanceof MethodNotFound || e instanceof InvalidRequest) {
      return new ErrorResponse(e, requestId);
    }

    if (e instanceof Error) {
      return new ErrorResponse(new ServerError(e.message, e.stack), requestId);
    }

    const error = new ServerError("Uncaught error");
    return new ErrorResponse(error, requestId);
  }
}
