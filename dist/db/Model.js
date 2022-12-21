"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = void 0;
const fs_1 = require("../utils/fs");
const enc_1 = require("../utils/enc");
const Document_1 = require("./Document");
const anytool_1 = require("anytool");
const filter_1 = require("../utils/filter");
const update_1 = require("../utils/update");
class Model {
    dbPath;
    schema;
    modelName;
    _enc;
    constructor(options) {
        this.dbPath = options.dbPath;
        this.schema = options.schema;
        this.modelName = options.modelName;
        Object.defineProperty(this, "_enc", {
            value: options.enc_pass,
            enumerable: false,
        });
    }
    async db(onlyArr = false) {
        const arr = (await (0, fs_1.readModel)(this.dbPath, this.modelName)) || [];
        if (onlyArr) {
            if (onlyArr === "document") {
                return arr.map((str) => new Document_1.Document({
                    dbPath: this.dbPath,
                    enc_pass: this._enc,
                    modelName: this.modelName,
                    schema: this.schema,
                }, (0, enc_1.toReadable)(str, this._enc)));
            }
            else
                return arr;
        }
        return arr.map((str) => (0, enc_1.toReadable)(str, this._enc));
    }
    async getById(_id) {
        const db = await this.db();
        const one = db.find((obj) => obj._id === _id);
        if (!one)
            return null;
        return new Document_1.Document({
            dbPath: this.dbPath,
            enc_pass: this._enc,
            modelName: this.modelName,
            schema: this.schema,
        }, one);
    }
    async all(filter) {
        const db = await this.db("document");
        let toAdd = db;
        if (filter) {
            if (typeof filter === "function") {
                toAdd = toAdd.filter(filter);
            }
            else {
                const filtered = (0, filter_1.FilterFunction)(filter, db);
                toAdd = filtered;
            }
        }
        return toAdd;
    }
    async get(filter) {
        const db = await this.db("document");
        const one = typeof filter === "function"
            ? db.find(filter)
            : (0, filter_1.FilterFunction)(filter, db, true);
        if (!one)
            return null;
        return one;
    }
    async deleteById(_id) {
        const db = await this.db("document");
        const one = db.find((obj) => obj._id === _id);
        if (!one)
            return;
        await (0, fs_1.writeModel)(this.dbPath, this.modelName, db
            .filter((obj) => obj._id !== one._id)
            .map((obj) => (0, enc_1.toBase)(obj.toJson(), this._enc)));
    }
    async delete(filter) {
        const db = await this.db("document");
        const one = typeof filter === "function"
            ? db.find(filter)
            : (0, filter_1.FilterFunction)(filter, db, true);
        if (!one)
            return;
        await (0, fs_1.writeModel)(this.dbPath, this.modelName, db
            .filter((obj) => obj._id !== one._id)
            .map((obj) => (0, enc_1.toBase)(obj.toJson(), this._enc)));
    }
    async deleteAll(filter) {
        const db = await this.db("document");
        if (!filter) {
            await (0, fs_1.writeModel)(this.dbPath, this.modelName, []);
            return;
        }
        const docs = typeof filter === "function"
            ? db.filter(filter)
            : (0, filter_1.FilterFunction)(filter, db);
        await (0, fs_1.writeModel)(this.dbPath, this.modelName, db
            .filter((obj) => !docs.find((doc) => doc._id === obj._id))
            .map((obj) => (0, enc_1.toBase)(obj.toJson(), this._enc)));
    }
    async update(filter, update) {
        const db = await this.db("document");
        const updated = (0, update_1.UpdateFunction)(filter, update, db, true);
        db[db.findIndex((obj) => obj._id === updated._id)] = updated;
        await (0, fs_1.writeModel)(this.dbPath, this.modelName, db.map((obj) => (0, enc_1.toBase)(obj.toJson(), this._enc)));
        return updated;
    }
    async updateAll(filter, update) {
        const db = await this.db("document");
        const updated = (0, update_1.UpdateFunction)(filter, update, db);
        await (0, fs_1.writeModel)(this.dbPath, this.modelName, db.map((f) => (0, enc_1.toBase)(updated.find((upt) => upt._id === f._id)?.toJson?.() || f.toJson(), this._enc)));
        return updated;
    }
    async create(document) {
        const { _id, _createdAt, ...values } = document;
        if (!this.schema.compare(values))
            return null;
        for (let key in values) {
            if (this.schema?.schema?.[key]?.unique) {
                if (await this.get({ [key]: values[key] }))
                    throw new Error(`Trying to duplicate unique value for key: ${key}`);
            }
        }
        try {
            const id = await this.generateId();
            const asDocument = new Document_1.Document({
                dbPath: this.dbPath,
                enc_pass: this._enc,
                modelName: this.modelName,
                schema: this.schema,
            }, {
                _id: id,
                _createdAt: new Date(),
                ...values,
            });
            const asArr = await this.db(true);
            const enced = (0, enc_1.toBase)(asDocument.toJson(), this._enc);
            asArr.push(enced);
            await (0, fs_1.writeModel)(this.dbPath, this.modelName, asArr);
            return asDocument;
        }
        catch {
            throw new Error("Unexpected Error at creating document");
        }
    }
    async generateId() {
        const db = await this.db();
        const $ = () => (0, anytool_1.uuid)(30, { aditional: "-=#@%^&" });
        let id = $();
        while (db.find((obj) => obj._id === id))
            id = $();
        return id;
    }
}
exports.Model = Model;
