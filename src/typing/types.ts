import { WithDocument } from "../db/Document";

export interface AnyObject {
  [k: string | number | symbol]: any;
}

export type ObjectWithId = AnyObject & ReservedValues;

export type ReservedObject<T extends object> = T & ReservedValues;

export const FilterMethods = ["$or"] as const;

export interface GetInType<T> {
  $in?: T[];
  $nin?: T[];
}

export const FilterMethodsIn: ReadonlyArray<keyof GetInType<any>> = [
  "$in",
  "$nin",
];

export type FilterMethodType = typeof FilterMethods[number];
export type FilterMethodInType = typeof FilterMethodsIn[number];

export type Filter<T extends any> =
  | ({
      [k in keyof T]?:
        | T[k]
        | {
            [n in FilterMethodInType]?: GetInType<T[k]>[n];
          };
    } & {
      [k: string | number]:
        | any
        | {
            [n in FilterMethodInType]?: GetInType<any>[n];
          };
    })
  | {
      [k in FilterMethodType]?: {
        [k in keyof T]?:
          | T[k]
          | {
              [n in FilterMethodInType]?: GetInType<T[k]>[n];
            };
      } & {
        [k: string | number]:
          | any
          | {
              [n in FilterMethodInType]?: GetInType<any>[n];
            };
      };
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

export const ReservedWordsArray: Array<keyof ReservedValues> = [
  "_createdAt",
  "_id",
];
