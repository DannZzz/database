"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = exports.Value = void 0;
const type_check_1 = require("type-check");
class Value {
    type;
    default;
    unique = false;
    constructor(type, options = {}) {
        this.type = type;
        if (options.default !== undefined) {
            this.default = options.default;
        }
        if (options.unique !== undefined) {
            this.unique = options.unique;
        }
    }
}
exports.Value = Value;
class Schema {
    schema;
    schemaWithStringKey;
    constructor(schema) {
        this.schema = schema;
        this.schemaWithStringKey = {};
        for (let k in schema) {
            this.schemaWithStringKey[k] = schema[k].type;
        }
    }
    compare(object) {
        if (Object.keys(object).length > Object.keys(this.schemaWithStringKey).length)
            throw new Error("Invalid size of data");
        for (let k in object) {
            if (!(k in this.schemaWithStringKey))
                throw new Error(`Key ${k} doesn't exist in schema`);
            if (!(0, type_check_1.typeCheck)(capitalize(this.schemaWithStringKey[k]), object[k]))
                throw new Error(`Value with key (${k}) must be ${this.schemaWithStringKey[k]}`);
        }
        return true;
    }
}
exports.Schema = Schema;
function capitalize(str) {
    return `${str}`.charAt(0).toUpperCase() + `${str}`.slice(1);
}
