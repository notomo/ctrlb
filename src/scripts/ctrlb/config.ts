import { Storage } from "webextension-polyfill-ts";

export class Config {
  public readonly DEFAULT_HOST: string = "127.0.0.1:8001";

  protected storage: Storage.LocalStorageArea;

  constructor(storage: Storage.LocalStorageArea) {
    this.storage = storage;
  }

  public async getHost(): Promise<string> {
    const items = await this.storage.get({ host: this.DEFAULT_HOST });
    const host = items.host as string;
    if (!this.validateHost(host)) {
      throw new ValidateError(host);
    }

    return host;
  }

  public async saveHost(host: string): Promise<void> {
    const trimmedHost = host.trim();
    if (!this.validateHost(trimmedHost)) {
      throw new ValidateError(trimmedHost);
    }

    return this.storage.set({
      host: trimmedHost,
    });
  }

  protected validateHost(host: string): boolean {
    const domainAndPort = host.split(":");
    if (domainAndPort.length < 1 || 2 < domainAndPort.length) {
      return false;
    }
    const ip = domainAndPort[0] as string;
    if (domainAndPort.length === 2) {
      const port = +domainAndPort[1];
      if (!Number.isInteger(port) || port <= 0) {
        return false;
      }
    }
    return this.isPrivate(ip);
  }

  private isPrivate(ip: string): boolean {
    const regex = /(^10\.)|(172\.(1[6-9]|2[0-9]|3[0-1]))|(^192\.168\.)|(localhost)|(127.0.0.1)/;
    return regex.test(ip);
  }
}

export class ValidateError extends Error {
  constructor(private host: string) {
    super();
  }

  toString() {
    return "allowed only private ip or localhost. actual: " + this.host;
  }
}
