import { Tuple } from "./tuple";
import { InvalidParams } from "./error";

export class Validator {
  protected readonly REQUIRED_NUMBER = 1;
  protected readonly OPTIONAL_NUMBER = 2;
  protected readonly REQUIRED_STRING = "required";
  protected readonly OPTIONAL_STRING = "optional";
  protected readonly REQUIRED_BOOLEAN = true;
  protected readonly OPTIONAL_BOOLEAN = false;

  protected readonly OPTIONALS = [
    this.OPTIONAL_NUMBER,
    this.OPTIONAL_STRING,
    this.OPTIONAL_BOOLEAN,
  ];

  protected readonly REQUIREDS = [
    this.REQUIRED_NUMBER,
    this.REQUIRED_STRING,
    this.REQUIRED_BOOLEAN,
  ];

  constructor() {}

  public requiredNumber(): number {
    return this.REQUIRED_NUMBER;
  }

  public requiredString(): string {
    return this.REQUIRED_STRING;
  }

  public requiredBoolean(): boolean {
    return this.REQUIRED_BOOLEAN;
  }

  public optionalNumber(): number | null {
    return this.OPTIONAL_NUMBER;
  }

  public optionalString(): string | null {
    return this.OPTIONAL_STRING;
  }

  public optionalBoolean(): boolean | null {
    return this.OPTIONAL_BOOLEAN;
  }

  protected isRequired(value: string | number | boolean): boolean {
    return this.REQUIREDS.includes(value);
  }

  protected isOptional(value: string | number | boolean): boolean {
    return this.OPTIONALS.includes(value);
  }

  public to<T extends Tuple>(
    values: { [index: string]: any },
    types: T,
    names: { [P in keyof T]: string }
  ): T {
    let results: { [index: string]: any } = {};
    let i = 0;
    for (const key of Object.values(names)) {
      if (typeof types[i] === "undefined") {
        throw new InvalidParams("validationValue must not be null.");
      }
      const validationValue = types[i];

      if (!(key in values) && this.isRequired(validationValue)) {
        throw new InvalidParams(key + " is a required argument.");
      }

      if (
        (!(key in values) || values[key] === null) &&
        this.isOptional(validationValue)
      ) {
        results[key] = null;
        continue;
      }

      const value = values[key];
      if (value === null) {
        throw new InvalidParams(key + " must not be void.");
      }

      if (typeof validationValue !== typeof value) {
        throw new InvalidParams(
          key +
            "'s value must be " +
            typeof validationValue +
            " type, but actual: " +
            typeof value
        );
      }

      results[key] = value;
      ++i;
    }

    return [...Object.values(results)] as T;
  }
}
