export interface AnyObject {
  [k: string | number | symbol]: any;
}

export type ObjectWithId = AnyObject & { _id: string };
