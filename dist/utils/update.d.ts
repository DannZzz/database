import { WithDocument } from "../db/Document";
import { Filter, Update } from "../typing/types";
export declare function UpdateFunction(filter: Filter<any>, update: Update<any>, db: WithDocument<any>): WithDocument<any>[];
export declare function UpdateFunction(filter: Filter<any>, update: Update<any>, db: WithDocument<any>, onlyOne: true): WithDocument<any>;
