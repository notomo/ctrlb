import { InvalidRequest } from "./error";

export class Notification {
  constructor(
    public readonly method: string,
    public readonly params: { [index: string]: any }
  ) {}
}

export class NotificationFactory {
  public create(
    method: string,
    params?: { [index: string]: any }
  ): Notification {
    if (params === undefined) {
      return new Notification(method, []);
    }
    return new Notification(method, params);
  }

  public createFromJson(decodedJson: any): Notification {
    const method = decodedJson.method;
    if (typeof method !== "string") {
      throw new InvalidRequest("Invalid Request: method(" + method + ")");
    }

    const params = decodedJson.params || {};
    if (typeof params !== "object") {
      throw new InvalidRequest(
        "Invalid Request: params(" + JSON.stringify(params) + ")"
      );
    }

    return new Notification(method, params);
  }
}
