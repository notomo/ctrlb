import { InvalidRequest } from "./error";

export interface IRequest {
  method: string;
  params: { [index: string]: any };
}

export class Request {
  constructor(
    public readonly id: string,
    public readonly method: string,
    public readonly params: { [index: string]: any }
  ) {}
}

export class RequestFactory {
  public createFromJson(decodedJson: any): Request {
    const id = decodedJson.id;
    if (typeof id !== "string") {
      throw new InvalidRequest("Invalid Request: id(" + id + ")");
    }

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

    return new Request(id, method, params);
  }
}
