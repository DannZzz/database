import { Schema } from "./Schema";
import path from "path";
import fs from "fs/promises";
import { readModel, writeModel } from "../utils/fs";
import {} from "crypto-js";
import { encrypt } from "../utils/encrypt";
import { toBase, toReadable } from "../utils/enc";
import { AnyObject, ObjectWithId } from "../typing/types";
import { Document, WithDocument } from "./Document";
import { uuid } from "anytool";

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
  private async db(onlyArr: boolean): Promise<string[]>;
  private async db(
    onlyArr: boolean = false
  ): Promise<ObjectWithId[] | string[]> {
    const arr = (await readModel(this.dbPath, this.modelName)) || [];
    if (onlyArr) return arr;
    return arr.map((str: string) => toReadable(str, this._enc));
  }

  async getById(_id: string): Promise<WithDocument<T> | null> {
    const enc = encrypt(_id);
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

  async all(): Promise<WithDocument<T>> {
    return (await this.db()).map(
      (obj) =>
        new Document(
          {
            dbPath: this.dbPath,
            enc_pass: this._enc,
            modelName: this.modelName,
            schema: this.schema,
          },
          obj as any
        )
    ) as any;
  }

  async create(document: T): Promise<WithDocument<T> | null> {
    const { _id, ...values } = document;
    if (!this.schema.compare(document)) return null;
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
