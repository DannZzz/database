import { Model } from "./Model";
import { Schema } from "./Schema";
interface DatabaseOptions {
    path: string;
    enc_pass?: string;
}
export declare class Database {
    readonly path: string;
    private readonly _enc;
    private readonly _models;
    constructor(path: string);
    constructor(options: DatabaseOptions);
    _create(): Promise<void>;
    createModel<T extends any>(modelName: string, schema: Schema<T>): Promise<Model<T>>;
}
export {};
