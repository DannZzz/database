import { AnyObject, ReservedValues } from "../typing/types";
interface NamedTypes {
    string: string;
    number: number;
    array: any[];
    object: object;
    boolean: boolean;
    date: Date;
}
export type FromType<T extends any> = T extends string ? "string" : T extends number ? "number" : T extends boolean ? "boolean" : T extends any[] ? "array" : T extends Date ? "date" : T extends object ? "object" : keyof NamedTypes;
export declare class Value<T extends any> {
    readonly type: FromType<T>;
    readonly default?: T | (() => T);
    readonly unique: boolean;
    constructor(type: FromType<T>, options?: {
        default?: T | (() => T);
        unique?: boolean;
    });
}
type ParseValueType<T extends AnyObject> = {
    [k in keyof T]: Value<T[k]>;
};
export declare class Schema<T extends AnyObject = unknown> {
    readonly schema: ParseValueType<Omit<T, keyof ReservedValues>>;
    schemaWithStringKey: {
        [k in keyof Omit<T, keyof ReservedValues>]: FromType<T>;
    };
    constructor(schema: ParseValueType<Omit<T, keyof ReservedValues>>);
    compare(object: AnyObject): boolean;
}
export {};
