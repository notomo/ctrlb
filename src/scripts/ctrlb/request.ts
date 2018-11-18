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
  public createFromJson(jsonString: any): Request {
    if (typeof jsonString !== "string") {
      throw new Error("Invalid request");
    }

    const decodedJson = JSON.parse(jsonString);

    const id = decodedJson.id;
    if (typeof id !== "string") {
      throw new Error("id is required");
    }

    const method = decodedJson.method;
    if (typeof method !== "string") {
      throw new Error("Invalid method: " + method);
    }

    const params = decodedJson.params || {};
    if (typeof params !== "object") {
      throw new Error("Invalid params: " + JSON.stringify(params));
    }

    return new Request(id, method, params);
  }
}
