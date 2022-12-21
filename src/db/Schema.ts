import { typeCheck } from "type-check";
import { AnyObject, ReservedValues } from "../typing/types";

interface NamedTypes {
  string: string;
  number: number;
  array: any[];
  object: object;
  boolean: boolean;
  date: Date;
}

export type FromType<T extends any> = T extends string
  ? "string"
  : T extends number
  ? "number"
  : T extends boolean
  ? "boolean"
  : T extends any[]
  ? "array"
  : T extends Date
  ? "date"
  : T extends object
  ? "object"
  : keyof NamedTypes;

export class Value<T extends any> {
  readonly type: FromType<T>;
  readonly default?: T | (() => T);
  readonly unique: boolean = false;
  constructor(
    type: FromType<T>,
    options: {
      default?: T | (() => T);
      unique?: boolean;
    } = {}
  ) {
    this.type = type;
    if (options.default !== undefined) {
      this.default = options.default;
    }

    if (options.unique !== undefined) {
      this.unique = options.unique;
    }
  }
}

type ParseValueType<T extends AnyObject> = { [k in keyof T]: Value<T[k]> };

export class Schema<T extends AnyObject = unknown> {
  schemaWithStringKey: {
    [k in keyof Omit<T, keyof ReservedValues>]: FromType<T>;
  };

  constructor(readonly schema: ParseValueType<Omit<T, keyof ReservedValues>>) {
    this.schemaWithStringKey = {} as any;
    for (let k in schema) {
      (this.schemaWithStringKey as any)[k] = schema[k].type;
    }
  }

  compare(object: AnyObject) {
    if (
      Object.keys(object).length > Object.keys(this.schemaWithStringKey).length
    )
      throw new Error("Invalid size of data");

    for (let k in object) {
      if (!(k in this.schemaWithStringKey))
        throw new Error(`Key ${k} doesn't exist in schema`);
      if (!typeCheck(capitalize(this.schemaWithStringKey[k]), object[k]))
        throw new Error(
          `Value with key (${k}) must be ${this.schemaWithStringKey[k]}`
        );
    }
    return true;
  }
}

function capitalize(str: string | TemplateStringsArray) {
  return `${str}`.charAt(0).toUpperCase() + `${str}`.slice(1);
}
