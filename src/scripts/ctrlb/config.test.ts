import { Config, ValidateError } from "./config";
import { Storage } from "webextension-polyfill-ts";

describe("Config", () => {
  it("getHost returns host if valid", async () => {
    const validHost = "127.0.0.1:8888";

    const StorageClass: jest.Mock<Storage.LocalStorageArea> = jest.fn(() => ({
      get: jest.fn().mockReturnValue({ host: validHost }),
    })) as any;
    const storage = new StorageClass();
    const config = new Config(storage);

    const host = await config.getHost();

    expect(host).toBe(validHost);
  });

  it("saveHost sets host if valid", async () => {
    const validHost = "127.0.0.1:8888";

    const setConfig = jest.fn();
    const StorageClass: jest.Mock<Storage.LocalStorageArea> = jest.fn(() => ({
      set: setConfig,
    })) as any;
    const storage = new StorageClass();
    const config = new Config(storage);

    await config.saveHost(validHost);

    expect(setConfig).toBeCalledWith({ host: validHost });
  });

  ["invalid:invalid:invalid", "invalid", "127.0.0.2"].forEach(invalidHost => {
    it(`getHost throws error if invalidHost: "${invalidHost}"`, async () => {
      const StorageClass: jest.Mock<Storage.LocalStorageArea> = jest.fn(() => ({
        get: jest.fn().mockReturnValue({ host: invalidHost }),
      })) as any;
      const storage = new StorageClass();
      const config = new Config(storage);

      expect(config.getHost()).rejects.toEqual(new ValidateError(invalidHost));
    });

    it(`saveHost throws error if invalidHost: "${invalidHost}"`, async () => {
      const StorageClass: jest.Mock<Storage.LocalStorageArea> = jest.fn(
        () => ({})
      ) as any;
      const storage = new StorageClass();
      const config = new Config(storage);

      expect(config.saveHost(invalidHost)).rejects.toEqual(
        new ValidateError(invalidHost)
      );
    });
  });
});
