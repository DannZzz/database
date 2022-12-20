import { AnyObject, ObjectWithId } from "../typing/types";
import { toBase, toReadable } from "../utils/enc";
import { readModel, writeModel } from "../utils/fs";
import { Schema } from "./Schema";

export type WithDocument<T extends AnyObject> = Document<T> & T;

export class Document<T extends AnyObject> {
  _id: string;
  private _exists: boolean;
  private dbPath: string;
  private modelName: string;
  private _enc: string;

  constructor(
    options: {
      dbPath: string;
      modelName: string;
      enc_pass: string;
      schema: Schema<T>;
    },
    data: T & { _id: string }
  ) {
    for (let k in data) {
      (this as any)[k] = data[k];
    }

    let updateDefs = false;
    for (let k in options?.schema?.schema) {
      if (!(k in data) && options?.schema?.schema[k].default !== undefined) {
        if (!updateDefs) updateDefs = true;
        (this as any)[k] = options?.schema?.schema[k].default;
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

  exists() {
    return !!this._exists;
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
