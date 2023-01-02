import { Schema } from "./Schema";
import path from "path";
import fs from "fs/promises";
import { readModel, writeModel } from "../utils/fs";
import {} from "crypto-js";
import { encrypt } from "../utils/encrypt";
import { toBase, toReadable } from "../utils/enc";
import {
  AnyObject,
  Filter,
  FilterMethods,
  ObjectWithId,
  ReservedObject,
  ReservedValues,
  Update,
} from "../typing/types";
import { Document, WithDocument } from "./Document";
import { uuid } from "anytool";
import { FilterFunction } from "../utils/filter";
import { UpdateFunction } from "../utils/update";
import { BaseEvent } from "./Event";

export class Model<T extends AnyObject> extends BaseEvent<T> {
  private readonly dbPath: string;
  private readonly _enc: string;

  constructor(readonly modelName: string, readonly schema: Schema<T>) {
    super();
  }

  private async db(): Promise<ObjectWithId[]>;
  private async db(convert: "document"): Promise<WithDocument<T>[]>;
  private async db(onlyArr: boolean): Promise<string[]>;
  private async db(
    onlyArr: boolean | "document" = false
  ): Promise<ObjectWithId[] | string[] | WithDocument<T>> {
    if (!this.dbPath || !this._enc)
      throw new Error(`Model ${this.modelName} is not registered`);
    const arr = (await readModel(this.dbPath, this.modelName)) || [];
    if (onlyArr) {
      if (onlyArr === "document") {
        return arr.map(
          (str: string) =>
            new Document(
              {
                dbPath: this.dbPath,
                enc_pass: this._enc,
                modelName: this.modelName,
                schema: this.schema,
              },
              toReadable(str, this._enc) as any
            )
        ) as WithDocument<T>[];
      } else return arr;
    }
    return arr.map((str: string) => toReadable(str, this._enc)) as any;
  }

  async getById(_id: string): Promise<WithDocument<T> | null> {
    const db = await this.db();
    const one = db.find((obj) => obj._id === _id) as any;
    if (!one) return null;
    return new Document(
      {
        dbPath: this.dbPath,
        enc_pass: this._enc,
        modelName: this.modelName,
        schema: this.schema,
      },
      one
    ) as WithDocument<T>;
  }

  async all(filter?: Filter<ReservedObject<T>>): Promise<WithDocument<T>[]> {
    const db = await this.db("document");
    let toAdd = db;
    if (filter) {
      if (typeof filter === "function") {
        toAdd = toAdd.filter(filter);
      } else {
        const filtered = FilterFunction(filter, db);
        toAdd = filtered;
      }
    }

    return toAdd;
  }

  async get(
    filter: Filter<ReservedObject<T>>
  ): Promise<WithDocument<T> | null> {
    const db = await this.db("document");

    const one =
      typeof filter === "function"
        ? db.find(filter)
        : FilterFunction(filter, db, true);
    if (!one) return null;
    return one;
  }

  async deleteById(_id: string): Promise<void> {
    const db = await this.db("document");

    const one = db.find((obj) => obj._id === _id);
    if (!one) return;

    await writeModel(
      this.dbPath,
      this.modelName,
      db
        .filter((obj) => obj._id !== one._id)
        .map((obj) => toBase(obj.toJson(), this._enc))
    );
    this.emit("delete", one);
  }

  async delete(filter: Filter<ReservedObject<T>>): Promise<void> {
    const db = await this.db("document");

    const one =
      typeof filter === "function"
        ? db.find(filter)
        : FilterFunction(filter, db, true);

    if (!one) return;

    await writeModel(
      this.dbPath,
      this.modelName,
      db
        .filter((obj) => obj._id !== one._id)
        .map((obj) => toBase(obj.toJson(), this._enc))
    );
    this.emit("delete", one);
  }

  async deleteAll(): Promise<void>;
  async deleteAll(filter: Filter<ReservedObject<T>>): Promise<void>;
  async deleteAll(filter?: Filter<ReservedObject<T>>): Promise<void> {
    const db = await this.db("document");

    if (!filter) {
      await writeModel(this.dbPath, this.modelName, []);
      db.forEach((doc) => this.emit("delete", doc));
      return;
    }

    const docs =
      typeof filter === "function"
        ? db.filter(filter)
        : FilterFunction(filter, db);

    await writeModel(
      this.dbPath,
      this.modelName,
      db
        .filter((obj) => !docs.find((doc) => doc._id === obj._id))
        .map((obj) => toBase(obj.toJson(), this._enc))
    );

    docs.forEach((doc) => this.emit("delete", doc));
  }

  async update(
    filter: Filter<ReservedObject<T>>,
    update: Update<T>
  ): Promise<WithDocument<T>> {
    const db = await this.db("document");
    const updated = UpdateFunction(filter, update, db, true);
    const oldClone = db.find((obj) => obj._id === updated._id).clone();
    db[db.findIndex((obj) => obj._id === updated._id)] = updated;
    await writeModel(
      this.dbPath,
      this.modelName,
      db.map((obj) => toBase(obj.toJson(), this._enc))
    );
    this.emit("update", oldClone, updated);
    return updated;
  }

  async updateAll(
    filter: Filter<ReservedObject<T>>,
    update: Update<T>
  ): Promise<WithDocument<T>[]> {
    const db = await this.db("document");

    const updated = UpdateFunction(filter, update, db);

    await writeModel(
      this.dbPath,
      this.modelName,
      db.map((f) =>
        toBase(
          updated.find((upt) => upt._id === f._id)?.toJson?.() || f.toJson(),
          this._enc
        )
      )
    );

    updated.forEach((doc) => {
      this.emit(
        "update",
        db.find((obj) => obj._id === doc._id),
        doc
      );
    });

    return updated;
  }

  async createAll(
    documents: Array<Omit<T, keyof ReservedValues>>
  ): Promise<Array<WithDocument<T>>> {
    const created = await Promise.all(
      documents.map(async (document) => {
        const { _id, _createdAt, ...values } = document;
        if (!this.schema.compare(values)) return null;

        for (let key in values) {
          if (this.schema?.schema?.[key]?.unique) {
            if (await this.get({ [key]: values[key as any] }))
              console.log(`Trying to duplicate unique value for key: ${key}`);
            return null;
          }
        }

        try {
          const id = await this.generateId();
          const asDocument = new Document(
            {
              dbPath: this.dbPath,
              enc_pass: this._enc,
              modelName: this.modelName,
              schema: this.schema,
            },
            {
              _id: id,
              _createdAt: new Date(),
              ...values,
            } as any
          ) as WithDocument<T>;
          const asArr = await this.db(true);
          const enced = toBase(asDocument.toJson(), this._enc);
          asArr.push(enced);
          await writeModel(this.dbPath, this.modelName, asArr);
          this.emit("create", asDocument);
          return asDocument;
        } catch {
          console.log("Unexpected Error at creating document");
          return null;
        }
      })
    );
    return created.filter((f) => !!f);
  }

  async create(
    document: Omit<T, keyof ReservedValues>
  ): Promise<WithDocument<T> | null> {
    const { _id, _createdAt, ...values } = document;
    if (!this.schema.compare(values)) return null;

    for (let key in values) {
      if (this.schema?.schema?.[key]?.unique) {
        if (await this.get({ [key]: values[key as any] }))
          throw new Error(`Trying to duplicate unique value for key: ${key}`);
      }
    }

    try {
      const id = await this.generateId();
      const asDocument = new Document(
        {
          dbPath: this.dbPath,
          enc_pass: this._enc,
          modelName: this.modelName,
          schema: this.schema,
        },
        {
          _id: id,
          _createdAt: new Date(),
          ...values,
        } as any
      ) as WithDocument<T>;
      const asArr = await this.db(true);
      const enced = toBase(asDocument.toJson(), this._enc);
      asArr.push(enced);
      await writeModel(this.dbPath, this.modelName, asArr);
      this.emit("create", asDocument);
      return asDocument;
    } catch {
      throw new Error("Unexpected Error at creating document");
    }
  }

  private async generateId(): Promise<string> {
    const db = await this.db();
    const $ = () => uuid(30, { aditional: "-=#@%^&" });
    let id = $();
    while (db.find((obj) => obj._id === id)) id = $();
    return id;
  }
}
