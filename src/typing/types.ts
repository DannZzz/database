import { WithDocument } from "../db/Document";

export interface AnyObject {
  [k: string | number | symbol]: any;
}

export type ObjectWithId = AnyObject & ReservedValues;

export type ReservedObject<T extends object> = T & ReservedValues;

export const FilterMethods = ["$or"] as const;

export type FilterMethodType = typeof FilterMethods[number];

export type Filter<T extends any> =
  | ({ [k in keyof T]?: T[k] } & { [k: string | number]: any })
  | {
      [k in FilterMethodType]?: {
        [k in keyof T]?: T[k];
      } & { [k: string | number]: any };
    }
  | ((document: WithDocument<T>) => boolean);

export const UpdateMethods = ["$set", "$inc", "$push"] as const;

export type UpdateMethodType = typeof UpdateMethods[number];

interface ParseUpdateType<T> {
  $set: T;
  $inc: number;
  $push: T extends any[] ? T[number] : any;
}

export type Update<T extends any> = {
  [u in UpdateMethodType]?: {
    [k in keyof T]?: ParseUpdateType<T[k]>[u];
  } & { [k: string | number]: any };
};

export interface ReservedValues {
  _id: string;
  _createdAt: Date;
}
