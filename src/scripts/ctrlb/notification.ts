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
}
