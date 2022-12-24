"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Document = void 0;
const enc_1 = require("../utils/enc");
const fs_1 = require("../utils/fs");
class Document {
    _id;
    _createdAt;
    dbPath;
    modelName;
    _enc;
    schema;
    constructor(options, data) {
        for (let k in data) {
            this[k] = data[k];
            if (options.schema.schemaWithStringKey[k] === "date") {
                this[k] = new Date(data[k]);
            }
        }
        this._createdAt = new Date(data._createdAt);
        let updateDefs = false;
        for (let k in options?.schema?.schema) {
            const def = options?.schema?.schema?.[k].default;
            if (!(k in data) && def !== undefined) {
                if (!updateDefs)
                    updateDefs = true;
                this[k] = def instanceof Function ? def() : def;
            }
        }
        Object.defineProperty(this, "dbPath", {
            value: options.dbPath,
            enumerable: false,
        });
        Object.defineProperty(this, "_enc", {
            value: options.enc_pass,
            enumerable: false,
        });
        Object.defineProperty(this, "modelName", {
            value: options.modelName,
            enumerable: false,
        });
        Object.defineProperty(this, "schema", {
            value: options.schema,
            enumerable: false,
        });
        Object.defineProperty(this, "_exists", {
            value: !!data,
            enumerable: false,
        });
        if (updateDefs)
            this.updateDefaults();
    }
    clone() {
        return new Document({
            dbPath: this.dbPath,
            enc_pass: this._enc,
            schema: this.schema,
            modelName: this.modelName,
        }, this);
    }
    async updateDefaults() {
        try {
            const db = (await (0, fs_1.readModel)(this.dbPath, this.modelName)).map((obj) => (0, enc_1.toReadable)(obj, this._enc));
            const index = db.findIndex((f) => f._id === this._id);
            db[index] = this;
            await (0, fs_1.writeModel)(this.dbPath, this.modelName, db.map((obj) => (0, enc_1.toBase)(obj, this._enc)));
        }
        catch { }
    }
    toJson() {
        const obj = { ...this, _createdAt: this._createdAt.getTime() };
        for (let k in this) {
            if (this.schema.schemaWithStringKey[k] === "date") {
                obj[k] = this[k].getTime();
            }
        }
        return obj;
    }
    async delete() {
        try {
            const db = (await (0, fs_1.readModel)(this.dbPath, this.modelName)).map((obj) => (0, enc_1.toReadable)(obj, this._enc));
            await (0, fs_1.writeModel)(this.dbPath, this.modelName, db
                .filter((obj) => obj._id !== this._id)
                .map((obj) => (0, enc_1.toBase)(obj, this._enc)));
        }
        catch {
            throw new Error("Unable to delete document");
        }
    }
}
exports.Document = Document;
