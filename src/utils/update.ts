import { WithDocument } from "../db/Document";
import { Filter, Update, UpdateMethods } from "../typing/types";
import { FilterFunction } from "./filter";
import { typeCheck } from "type-check";

export function UpdateFunction(
  filter: Filter<any>,
  update: Update<any>,
  db: WithDocument<any>
): WithDocument<any>[];
export function UpdateFunction(
  filter: Filter<any>,
  update: Update<any>,
  db: WithDocument<any>,
  onlyOne: true
): WithDocument<any>;
export function UpdateFunction(
  filter: Filter<any>,
  update: Update<any>,
  db: WithDocument<any>[],
  onlyOne?: true
): WithDocument<any> | WithDocument<any>[] {
  let arr =
    typeof filter === "function"
      ? db.filter(filter as any)
      : FilterFunction(filter, db).map((obj) => {
          return obj?.clone?.();
        });

  UpdateMethods.forEach((method) => {
    if (method in update) {
      switch (method) {
        case "$set": {
          for (let k in update[method]) {
            arr = arr.map((obj) => {
              obj[k] = update[method][k];
              return obj;
            });
          }
          break;
        }

        case "$inc": {
          for (let k in update[method]) {
            if (!typeCheck("Number", update[method][k])) continue;
            arr = arr.map((obj) => {
              if (typeCheck("Number", obj[k])) obj[k] += update[method][k];
              return obj;
            });
          }
          break;
        }

        case "$push": {
          for (let k in update[method]) {
            arr = arr.map((obj) => {
              if (typeCheck("Array", obj[k])) obj[k].push(update[method][k]);
              return obj;
            });
          }
          break;
        }

        default:
          break;
      }
    }
  });

  if (onlyOne) return arr[0];
  return arr;
}
