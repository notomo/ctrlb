export class Request {
  constructor(
    public readonly id: string,
    public readonly actionGroupName: string,
    public readonly actionName: string,
    public readonly params: {}
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
      throw new Error("Invalid id");
    }

    const method = decodedJson.method || "";
    if (typeof method !== "string") {
      throw new Error("Invalid method");
    }

    const paths = method.split("/");
    if (paths.length <= 1) {
      throw new Error("Invalid actionGroup/actionName");
    }
    const actionGroupName = paths[0];
    const actionName = paths.slice(1).join("/");

    const params = decodedJson.params || {};
    if (typeof params !== "object") {
      throw new Error("Invalid params");
    }

    return new Request(id, actionGroupName, actionName, params);
  }
}
