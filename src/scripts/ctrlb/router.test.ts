import { Validator } from "./validator";
import { Router } from "./router";
import { MethodNotFound } from "./error";

describe("Router", () => {
  let router: Router;

  let to: jest.Mock;

  beforeEach(() => {
    const ValidatorClass = jest.fn<Validator>(() => ({}));
    const validator = new ValidatorClass();

    router = new Router(validator);
  });

  it("getAll", () => {
    const tab = {
      action: () => {},
    };

    router.add("tab/scroll/down", tab, tab.action, [], []);

    const result = router.getAll();

    expect(result).toEqual([{ name: "tab/scroll/down", params: [] }]);
  });

  it("match", async () => {
    const url = "urlValue";

    to = jest.fn().mockReturnValue([url]);
    const ValidatorClass = jest.fn<Validator>(() => ({
      to: to,
    }));
    const validator = new ValidatorClass();
    router = new Router(validator);

    const tab = {
      action: (url: string) => "url: " + url,
    };
    router.add("tab/open", tab, tab.action, [""], ["url"]);

    const request = {
      method: "tab/open",
      params: { url: url },
    };

    const result = await router.match(request);

    expect(result).toEqual("url: " + url);
  });

  it("match throws MethodNotFound", async () => {
    const tab = {
      action: () => {},
    };
    router.add("tab/scroll/down", tab, tab.action, [], []);

    const methodName = "invalid";
    const request = {
      method: methodName,
      params: {},
    };

    const expectedError = new MethodNotFound(methodName);
    expect(router.match(request)).rejects.toEqual(expectedError);
  });
});
