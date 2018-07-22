import { ActionArgs, NoArgsAction, IdArgsAction } from "./action";

export class Validator<K> {
  protected readonly REQUIRED_NUMBER = 1;
  protected readonly OPTIONAL_NUMBER = 2;
  protected readonly REQUIRED_STRING = "required";
  protected readonly OPTIONAL_STRING = "optional";
  protected readonly REQUIRED_BOOLEAN = true;
  protected readonly OPTIONAL_BOOLEAN = false;

  protected readonly OPTIONALS = [
    this.OPTIONAL_NUMBER,
    this.OPTIONAL_STRING,
    this.OPTIONAL_BOOLEAN
  ];

  protected readonly REQUIREDS = [
    this.REQUIRED_NUMBER,
    this.REQUIRED_STRING,
    this.REQUIRED_BOOLEAN
  ];

  constructor(protected readonly actionGroup: K) {}

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

  public noArgs<T extends { [index: string]: NoArgsAction }>(
    noArgsActions: T,
    actionName: keyof T & string
  ) {
    return (args: ActionArgs) => {
      const noArgsAction = noArgsActions[actionName];
      if (Object.keys(args).length) {
        throw new Error(actionName + " 's args must be emtpy.");
      }
      const f = noArgsAction.bind(this.actionGroup);
      return f();
    };
  }

  public idArgs<T extends { [index: string]: IdArgsAction }>(
    idArgsActions: T,
    actionName: keyof T & string
  ) {
    return (args: ActionArgs) => {
      const id = this.has({ id: this.requiredNumber() }, args).id;
      const idArgsAction = idArgsActions[actionName];
      const f = idArgsAction.bind(this.actionGroup);
      return f(id);
    };
  }

  public has<T extends ActionArgs>(valid: T, args: ActionArgs): T {
    let results = {} as T;
    for (const key of Object.keys(valid)) {
      const validationValue = valid[key];
      if (validationValue === null) {
        throw new Error("validationValue must not be null.");
      }

      if (!(key in args) && this.isRequired(validationValue)) {
        throw new Error(key + " is a required argument.");
      }

      if (!(key in args) && this.isOptional(validationValue)) {
        results[key] = null;
        continue;
      }

      const value: string | number | boolean | null = args[key];
      if (value === null) {
        if (this.isOptional(validationValue)) {
          results[key] = null;
          continue;
        }
        throw new Error(key + " must not be void.");
      }

      if (typeof validationValue !== typeof value) {
        throw new Error(
          key + "'s value must be " + typeof validationValue + " type."
        );
      }

      results[key] = value;
    }
    return results;
  }
}
