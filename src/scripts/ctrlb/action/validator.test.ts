import { Validator } from "./validator";

describe("Validator", () => {
  let validator: Validator<{}>;
  let get: jest.Mock;
  let up: jest.Mock;
  get = jest.fn(id => id);
  up = jest.fn(id => id);
  const actionGroup = {
    get: get,
    up: up
  };

  beforeEach(() => {
    validator = new Validator(actionGroup);
  });

  it("requiredBoolean", async () => {
    expect(typeof validator.requiredBoolean()).toBe("boolean");
  });

  it("optionalBoolean", async () => {
    expect(typeof validator.optionalBoolean()).toBe("boolean");
  });

  it("noArgs throw error if args are not empty", async () => {
    const noArgsActions = {
      up: actionGroup.up
    };

    const action = validator.noArgs(noArgsActions, "up");

    expect(() => action({ id: 1 })).toThrowError(/up's args must be emtpy/);
  });

  it("idArgs", async () => {
    const idArgsActions = {
      get: actionGroup.get
    };

    const action = validator.idArgs(idArgsActions, "get");

    const id = 1;
    const arg = { id: id };
    expect(action(arg)).toBe(id);
  });

  it("has complete optional value", () => {
    const arg = { url: null };

    const args = validator.has({ url: validator.optionalString() }, arg);

    expect(args).toEqual({ url: null });
  });

  it("has throw error if validation value is null", () => {
    const arg = { url: null };

    expect(() => validator.has({ url: null }, arg)).toThrowError(
      /validationValue must not be null./
    );
  });

  it("has throw error if required argument is not found", () => {
    const arg = {};

    expect(() =>
      validator.has({ url: validator.requiredString() }, arg)
    ).toThrowError(/is a required argument./);
  });

  it("has throw error if required argument is void", () => {
    const arg = { url: null };

    expect(() =>
      validator.has({ url: validator.requiredString() }, arg)
    ).toThrowError(/must not be void./);
  });

  it("has throw error if argument's type does not match", () => {
    const arg = { url: 1 };

    expect(() =>
      validator.has({ url: validator.requiredString() }, arg)
    ).toThrowError(/value must be string type./);
  });
});
