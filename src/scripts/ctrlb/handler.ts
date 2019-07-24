import { RequestFactory } from "./request";
import { NotificationFactory } from "./notification";
import {
  ResponseFactory,
  Response,
  ErrorResponse,
  JsonSerializable,
} from "./response";
import { Router } from "./router";
import { InvalidRequest, ParseError } from "./error";

export class MessageHandler {
  constructor(
    protected readonly router: Router,
    protected readonly requestFactory: RequestFactory,
    protected readonly notificationFactory: NotificationFactory,
    protected readonly responseFactory: ResponseFactory
  ) {}

  public async handle(
    jsonString: any
  ): Promise<[JsonSerializable | null, JsonSerializable | null, boolean]> {
    if (typeof jsonString !== "string") {
      const err = new InvalidRequest("Invalid Request");
      const errResponse = this.responseFactory.createError(err);
      return [null, errResponse, false];
    }

    let decodedJson;
    try {
      decodedJson = JSON.parse(jsonString);
    } catch (e) {
      const err = new ParseError(e.message);
      const errResponse = this.responseFactory.createError(err);
      return [null, errResponse, false];
    }

    if (!Array.isArray(decodedJson)) {
      return this.handleJson(decodedJson);
    }

    const results = await Promise.all(
      decodedJson.map(json => {
        return this.handleJson(json);
      })
    );

    return this.responseFactory.createBatch(results);
  }

  protected async handleJson(
    decodedJson: any
  ): Promise<[Response | null, ErrorResponse | null, boolean]> {
    const id = decodedJson.id;
    if (typeof id !== "string") {
      const notification = this.notificationFactory.createFromJson(decodedJson);

      let errResponse: ErrorResponse | null = null;
      await this.router.match(notification).catch(e => {
        errResponse = this.responseFactory.createError(e);
      });

      return [null, errResponse, true];
    }

    const request = this.requestFactory.createFromJson(decodedJson);

    let errResponse: ErrorResponse | null = null;
    const result = await this.router.match(request).catch(e => {
      errResponse = this.responseFactory.createError(e, request.id);
    });

    if (errResponse !== null) {
      return [null, errResponse, false];
    }

    if (result === undefined) {
      return [null, null, false];
    }

    const response = this.responseFactory.create(result, request.id);
    return [response, null, false];
  }

  public async handleNotify(
    method: string,
    params?: { [index: string]: any }
  ): Promise<[Response | null, ErrorResponse | null]> {
    const notification = this.notificationFactory.create(method, params);

    let errResponse: ErrorResponse | null = null;
    const result = await this.router.match(notification).catch(e => {
      errResponse = this.responseFactory.createError(e);
    });

    if (errResponse !== null) {
      return [null, errResponse];
    }

    const response = this.responseFactory.create(result);
    return [response, null];
  }

  public handleNotifyWithData(data: {}): Response {
    return this.responseFactory.create(data);
  }
}
