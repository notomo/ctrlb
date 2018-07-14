import { Config, ConfigStorage, ValidateError } from "./config";

describe("Config", () => {
  it("getHost returns host if valid", async () => {
    const validHost = "127.0.0.1:8888";

    const ConfigStorageClass = jest.fn<ConfigStorage>(() => ({
      get: jest.fn().mockReturnValue({ host: validHost })
    }));
    const storage = new ConfigStorageClass();
    const config = new Config(storage);

    const host = await config.getHost();

    expect(host).toBe(validHost);
  });

  it("saveHost sets host if valid", async () => {
    const validHost = "127.0.0.1:8888";

    const setConfig = jest.fn();
    const ConfigStorageClass = jest.fn<ConfigStorage>(() => ({
      set: setConfig
    }));
    const storage = new ConfigStorageClass();
    const config = new Config(storage);

    await config.saveHost(validHost);

    expect(setConfig).toBeCalledWith({ host: validHost });
  });

  ["invalid:invalid:invalid", "invalid", "127.0.0.2"].forEach(invalidHost => {
    it(`getHost throws error if invalidHost: "${invalidHost}"`, async () => {
      const ConfigStorageClass = jest.fn<ConfigStorage>(() => ({
        get: jest.fn().mockReturnValue({ host: invalidHost })
      }));
      const storage = new ConfigStorageClass();
      const config = new Config(storage);

      expect(config.getHost()).rejects.toEqual(new ValidateError(invalidHost));
    });

    it(`saveHost throws error if invalidHost: "${invalidHost}"`, async () => {
      const ConfigStorageClass = jest.fn<ConfigStorage>(() => ({}));
      const storage = new ConfigStorageClass();
      const config = new Config(storage);

      expect(config.saveHost(invalidHost)).rejects.toEqual(
        new ValidateError(invalidHost)
      );
    });
  });
});
