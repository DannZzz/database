import { Schema } from "./Schema";
import { AnyObject, Filter, ReservedObject, ReservedValues, Update } from "../typing/types";
import { WithDocument } from "./Document";
interface ModelOptions<T extends any> {
    schema: Schema<T>;
    dbPath: string;
    modelName: string;
    enc_pass?: string;
}
export declare class Model<T extends AnyObject> {
    private readonly dbPath;
    schema: Schema<T>;
    modelName: string;
    private readonly _enc;
    constructor(options: ModelOptions<T>);
    private db;
    getById(_id: string): Promise<WithDocument<T> | null>;
    all(filter?: Filter<ReservedObject<T>>): Promise<WithDocument<T>[]>;
    get(filter: Filter<ReservedObject<T>>): Promise<WithDocument<T> | null>;
    deleteById(_id: string): Promise<void>;
    delete(filter: Filter<ReservedObject<T>>): Promise<void>;
    deleteAll(): Promise<void>;
    deleteAll(filter: Filter<ReservedObject<T>>): Promise<void>;
    update(filter: Filter<ReservedObject<T>>, update: Update<T>): Promise<WithDocument<T>>;
    updateAll(filter: Filter<ReservedObject<T>>, update: Update<T>): Promise<WithDocument<T>[]>;
    create(document: Omit<T, keyof ReservedValues>): Promise<WithDocument<T> | null>;
    private generateId;
}
export {};
