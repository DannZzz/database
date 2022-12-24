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

  async _create() {
    try {
      await fs.readdir(this.path).catch(async () => await fs.mkdir(this.path));
    } catch {
      throw new Error("Can not create directory");
    }
  }

  async createModel<T extends any>(
    modelName: string,
    schema: Schema<T>
  ): Promise<Model<T>> {
    const model = new Model({
      modelName,
      schema,
      dbPath: this.path,
      enc_pass: this._enc,
    });
    try {
      const p = path.join(this.path, modelName + ".dann");
      await fs.readFile(p).catch(() => {
        fs.writeFile(p, "");
      });
    } catch {
      throw new Error(
        "Can't create model file, maybe parent folder doesn't exist"
      );
    }
    this._models.push(model);
    return model;
  }
}
