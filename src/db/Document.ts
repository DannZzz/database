import {
  AnyObject,
  ObjectWithId,
  ReservedObject,
  ReservedValues,
} from "../typing/types";
import { toBase, toReadable } from "../utils/enc";
import { readModel, writeModel } from "../utils/fs";
import { Schema } from "./Schema";

export type WithDocument<T extends AnyObject> = Document<T> & T;

export class Document<T extends AnyObject> implements ReservedValues {
  _id: string;
  _createdAt: Date;
  private dbPath: string;
  private modelName: string;
  private _enc: string;
  private schema: Schema<T>;

  constructor(
    options: {
      dbPath: string;
      modelName: string;
      enc_pass: string;
      schema: Schema<T>;
    },
    data: ReservedObject<T>
  ) {
    for (let k in data) {
      (this as any)[k] = data[k];
      if (options.schema.schemaWithStringKey[k] === "date") {
        this[k] = new Date(data[k]);
      }
    }
    this._createdAt = new Date(data._createdAt);

    let updateDefs = false;
    for (let k in options?.schema?.schema) {
      const def = options?.schema?.schema?.[k].default;
      if (!(k in data) && def !== undefined) {
        if (!updateDefs) updateDefs = true;
        (this as any)[k] = def instanceof Function ? def() : def;
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

    if (updateDefs) this.updateDefaults();
  }

  clone(): WithDocument<T> {
    return new Document(
      {
        dbPath: this.dbPath,
        enc_pass: this._enc,
        schema: this.schema,
        modelName: this.modelName,
      },
      this as any
    ) as any;
  }

  private async updateDefaults() {
    try {
      const db = ((await readModel(this.dbPath, this.modelName)) as any[]).map(
        (obj) => toReadable(obj, this._enc)
      );

      const index = db.findIndex((f) => f._id === this._id);

      db[index] = this;

      await writeModel(
        this.dbPath,
        this.modelName,
        db.map((obj) => toBase(obj, this._enc))
      );
    } catch {}
  }

  toJson(): object {
    const obj = { ...this, _createdAt: this._createdAt.getTime() };
    for (let k in this) {
      if ((this.schema.schemaWithStringKey as any)[k] === "date") {
        obj[k] = (this[k] as any).getTime();
      }
    }
    return obj;
  }

  async delete() {
    try {
      const db = ((await readModel(this.dbPath, this.modelName)) as any[]).map(
        (obj) => toReadable(obj, this._enc)
      );

      await writeModel(
        this.dbPath,
        this.modelName,
        db
          .filter((obj) => obj._id !== this._id)
          .map((obj) => toBase(obj, this._enc))
      );
    } catch {
      throw new Error("Unable to delete document");
    }
  }
}
