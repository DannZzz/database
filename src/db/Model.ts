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
} from "../typing/types";
import { Document, WithDocument } from "./Document";
import { uuid } from "anytool";
import { FilterFunction } from "../utils/filter";

interface ModelOptions<T extends any> {
  schema: Schema<T>;
  dbPath: string;
  modelName: string;
  enc_pass?: string;
}

export class Model<T extends AnyObject> {
  private readonly dbPath: string;
  schema: Schema<T>;
  modelName: string;
  private readonly _enc: string;

  constructor(options: ModelOptions<T>) {
    this.dbPath = options.dbPath;
    this.schema = options.schema;
    this.modelName = options.modelName;
    Object.defineProperty(this, "_enc", {
      value: options.enc_pass,
      enumerable: false,
    });
  }

  private async db(): Promise<ObjectWithId[]>;
  private async db(convert: "document"): Promise<WithDocument<T>[]>;
  private async db(onlyArr: boolean): Promise<string[]>;
  private async db(
    onlyArr: boolean | "document" = false
  ): Promise<ObjectWithId[] | string[] | WithDocument<T>> {
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
    return arr.map((str: string) => toReadable(str, this._enc));
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

  async all(filter?: Filter<T>): Promise<WithDocument<T>[]> {
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

  async get(filter: Filter<T>): Promise<WithDocument<T> | null> {
    const db = await this.db("document");

    const one =
      typeof filter === "function"
        ? db.find(filter)
        : FilterFunction(filter, db, true);
    if (!one) return null;
    return one;
  }

  async create(document: T): Promise<WithDocument<T> | null> {
    const { _id, ...values } = document;
    if (!this.schema.compare(values)) return null;

    for (let key in values) {
      if (this.schema?.schema?.[key]?.unique) {
        if (await this.get({ [key]: values[key] }))
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
          ...values,
        } as any
      ) as WithDocument<T>;
      const asArr = await this.db(true);
      const enced = toBase(asDocument, this._enc);
      asArr.push(enced);
      await writeModel(this.dbPath, this.modelName, asArr);
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
