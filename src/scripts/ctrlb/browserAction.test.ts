import { Button } from "./browserAction";
import { BrowserAction } from "webextension-polyfill-ts";

describe("Button", () => {
  let button: Button;
  let setIcon: jest.Mock;

  beforeEach(() => {
    setIcon = jest.fn();

    const BrowserActionClass = jest.fn<BrowserAction.Static>(() => ({
      setIcon: setIcon,
    }));
    const browserAction = new BrowserActionClass();

    button = new Button(browserAction);
  });

  it("enable", () => {
    button.enable();

    expect(setIcon).toHaveBeenCalledWith({ path: "images/icon-19.png" });
  });

  it("disable", () => {
    button.disable();

    expect(setIcon).toHaveBeenCalledWith({ path: "images/icon-19-gray.png" });
  });
});
