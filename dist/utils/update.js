"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFunction = void 0;
const types_1 = require("../typing/types");
const filter_1 = require("./filter");
const type_check_1 = require("type-check");
function UpdateFunction(filter, update, db, onlyOne) {
    let arr = typeof filter === "function"
        ? db.filter(filter)
        : (0, filter_1.FilterFunction)(filter, db).map((obj) => {
            return obj?.clone?.();
        });
    types_1.UpdateMethods.forEach((method) => {
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
                        if (!(0, type_check_1.typeCheck)("Number", update[method][k]))
                            continue;
                        arr = arr.map((obj) => {
                            if ((0, type_check_1.typeCheck)("Number", obj[k]))
                                obj[k] += update[method][k];
                            return obj;
                        });
                    }
                    break;
                }
                case "$push": {
                    for (let k in update[method]) {
                        arr = arr.map((obj) => {
                            if ((0, type_check_1.typeCheck)("Array", obj[k]))
                                obj[k].push(update[method][k]);
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
    if (onlyOne)
        return arr[0];
    return arr;
}
exports.UpdateFunction = UpdateFunction;
