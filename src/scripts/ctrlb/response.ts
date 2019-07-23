import { EventType } from "./event";
import {
  ApplicationError,
  MethodNotFound,
  ServerError,
  InvalidRequest,
  InvalidParams,
  ParseError,
} from "./error";

export interface JsonSerializable {
  toJson(): string;
}

export class Response {
  constructor(
    protected readonly data: {},
    protected readonly requestId?: string
  ) {}

  public json(eventName?: EventType): {} {
    const body = {
      data: this.data,
      eventName: eventName,
    };
    return {
      body: body,
      id: this.requestId,
    };
  }

  public toJson(): string {
    return JSON.stringify(this.json());
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

  public json(): {} {
    return {
      error: {
        code: this.error.code,
        message: this.error.toString(),
        data: { name: this.error.name, stack: this.error.stack },
      },
      id: this.requestId,
    };
  }

  public toJson(): string {
    return JSON.stringify(this.json());
  }
}

export class BatchResponse {
  constructor(protected readonly allResponses: ReadonlyArray<{}>) {}

  public toJson(): string {
    return JSON.stringify(this.allResponses);
  }
}

export class ResponseFactory {
  public create(body: {}, requestId?: string): Response {
    return new Response(body, requestId);
  }

  public createError(e: any, requestId?: string): ErrorResponse {
    if (
      e instanceof MethodNotFound ||
      e instanceof InvalidRequest ||
      e instanceof InvalidParams ||
      e instanceof ParseError
    ) {
      return new ErrorResponse(e, requestId);
    }

    if (e instanceof Error) {
      return new ErrorResponse(new ServerError(e.message, e.stack), requestId);
    }

    const error = new ServerError("Uncaught error");
    return new ErrorResponse(error, requestId);
  }

  public createBatch(
    results: ReadonlyArray<[Response | null, ErrorResponse | null, boolean]>
  ): [BatchResponse | null, BatchResponse | null, boolean] {
    const allResponses = [];
    const errResponses = [];
    let isAllNotification = true;
    for (const result of results) {
      if (result[1] !== null) {
        const json = result[1].json();
        allResponses.push(json);
        errResponses.push(json);
      } else if (result[0] !== null) {
        allResponses.push(result[0].json());
      }
      if (!result[2]) {
        isAllNotification = false;
      }
    }

    const batchResponse =
      allResponses.length === 0 ? null : new BatchResponse(allResponses);
    const errBatchResponse =
      errResponses.length === 0 ? null : new BatchResponse(errResponses);
    return [batchResponse, errBatchResponse, isAllNotification];
  }
}
