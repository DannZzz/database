import { WithDocument } from "../db/Document";
import { ObjectWithId, FilterMethods, Filter } from "../typing/types";

export function FilterFunction(
  _filter: Filter<any>,
  db: WithDocument<any>[]
): WithDocument<any>[];
export function FilterFunction(
  _filter: Filter<any>,
  db: WithDocument<any>[],
  onlyOne: boolean
): WithDocument<any>;
export function FilterFunction(
  _filter: Filter<any>,
  db: WithDocument<any>[],
  onlyOne: boolean = false
): WithDocument<any>[] | WithDocument<any> {
  const founds: WithDocument<any>[] = [];
  const filter = { ..._filter };
  FilterMethods.forEach((method) => {
    if (method in filter) {
      switch (method) {
        case "$or": {
          for (let key in filter[method]) {
            const found = db.find((f) => f[key] === filter[method][key]);
            if (found) {
              founds.push(found);
              break;
            }
          }
          delete filter["$or"];
          break;
        }

        default:
          break;
      }
    }
  });

  if (onlyOne && founds.length) {
    return founds[0];
  }

  const filterKeys = Object.keys(filter);

  if (filterKeys.length) {
    if (onlyOne) {
      return (
        db.find((f) => filterKeys.every((key) => f[key] === filter[key])) ||
        null
      );
    } else {
      db.forEach((f) => {
        if (filterKeys.every((key) => f[key] === filter[key])) {
          founds.push(f);
        }
      });
    }
  }

  return founds;
}
