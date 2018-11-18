export class ApplicationError extends Error {
  get code(): number {
    return -32001;
  }

  get name(): string {
    return "ApplicationError";
  }

  toString(): string {
    return "Application error";
  }
}

export class InvalidRequest extends ApplicationError {
  constructor(protected readonly _message: string) {
    super();
  }

  get code(): number {
    return -32600;
  }

  get name(): string {
    return "InvalidRequest";
  }

  toString(): string {
    return this._message;
  }
}

export class ParseError extends ApplicationError {
  constructor(protected readonly _message: string) {
    super();
  }

  get code(): number {
    return -32700;
  }

  get name(): string {
    return "ParseError";
  }

  toString(): string {
    return this._message;
  }
}

export class MethodNotFound extends ApplicationError {
  constructor(protected readonly method: string) {
    super();
  }

  get name(): string {
    return "MethodNotFound";
  }

  get code(): number {
    return -32601;
  }

  toString(): string {
    return "Method not found: " + this.method;
  }
}

export class ServerError extends ApplicationError {
  constructor(
    protected readonly _message: string,
    protected readonly _stack?: string
  ) {
    super();
  }

  get name(): string {
    return "ServerError";
  }

  get code(): number {
    return -32000;
  }

  get message(): string {
    return this._message;
  }

  get stack(): string | undefined {
    return this._stack;
  }

  toString(): string {
    return "Server error";
  }
}
