import { WithDocument } from "../db/Document";

export interface AnyObject {
  [k: string | number | symbol]: any;
}

export type ObjectWithId = AnyObject & { _id: string };

export const FilterMethods = ["$or"] as const;

export type FilterMethodType = typeof FilterMethods[number];

export type Filter<T extends any> =
  | { [k in keyof T]?: T[k] }
  | { [k in FilterMethodType]?: { [k in keyof T]: T[k] } }
  | ((document: WithDocument<T>) => boolean);
