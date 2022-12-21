import { WithDocument } from "../db/Document";
import { Filter } from "../typing/types";
export declare function FilterFunction(_filter: Filter<any>, db: WithDocument<any>[]): WithDocument<any>[];
export declare function FilterFunction(_filter: Filter<any>, db: WithDocument<any>[], onlyOne: boolean): WithDocument<any>;
