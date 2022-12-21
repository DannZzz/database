import { AnyObject, ReservedObject, ReservedValues } from "../typing/types";
import { Schema } from "./Schema";
export type WithDocument<T extends AnyObject> = Document<T> & T;
export declare class Document<T extends AnyObject> implements ReservedValues {
    _id: string;
    _createdAt: Date;
    private dbPath;
    private modelName;
    private _enc;
    private schema;
    constructor(options: {
        dbPath: string;
        modelName: string;
        enc_pass: string;
        schema: Schema<T>;
    }, data: ReservedObject<T>);
    clone(): Document<T>;
    private updateDefaults;
    toJson(): object;
    delete(): Promise<void>;
}
