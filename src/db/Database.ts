import { Model } from "./Model";
import { Schema } from "./Schema";
import fs from "fs/promises";
import path from "path";

export interface DatabaseOptions {
  path: string;
  enc_pass?: string;
}

export class Database {
  readonly path: string;
  private readonly _enc: string;

  private readonly _models: Model<any>[] = [];

  constructor(path: string);
  constructor(options: DatabaseOptions);
  constructor(options: DatabaseOptions | string) {
    this.path = typeof options === "string" ? options : options.path;
    if (typeof options === "object") {
      if (options.enc_pass)
        Object.defineProperty(this, "_enc", {
          value: options.enc_pass,
          enumerable: false,
        });
    }
  }

  async registerModel<T extends any>(model: Model<T>): Promise<void> {
    Object.defineProperty(model, "_enc", {
      value: this._enc,
      enumerable: false,
    });
    Object.defineProperty(model, "dbPath", {
      value: this.path,
      enumerable: false,
    });

    try {
      const p = path.join(this.path, model.modelName + ".dann");
      await fs.readFile(p).catch(() => {
        fs.writeFile(p, "");
      });
    } catch {
      throw new Error(
        "Can't create model file, maybe parent folder doesn't exist"
      );
    }
    this._models.push(model);
  }
}
