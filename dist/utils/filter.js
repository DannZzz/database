"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterFunction = void 0;
const types_1 = require("../typing/types");
function FilterFunction(_filter, db, onlyOne = false) {
    const founds = [];
    if (!_filter || Object.keys(_filter).length === 0)
        return onlyOne ? [...db][0] : [...db];
    const filter = { ..._filter };
    types_1.FilterMethods.forEach((method) => {
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
            return (db.find((f) => filterKeys.every((key) => f[key] === filter[key])) ||
                null);
        }
        else {
            db.forEach((f) => {
                if (filterKeys.every((key) => f[key] === filter[key])) {
                    founds.push(f);
                }
            });
        }
    }
    return founds;
}
exports.FilterFunction = FilterFunction;
