import * as path from "path";
import fs from "fs/promises";

import { Database, DatabaseOptions } from "./db/Database";
export { Schema, Value } from "./db/Schema";
export { Model } from "./db/Model";
export type { Database } from "./db/Database";
export type { WithDocument } from "./db/Document";

export async function createDatabase(
  options: string | DatabaseOptions
): Promise<Database> {
  const resolvedPath = path.resolve(
    typeof options === "string" ? options : options.path
  );
  const db = new Database({
    path: resolvedPath,
    ...(typeof options === "object" ? options : {}),
  });

  try {
    await fs
      .readdir(resolvedPath)
      .catch(async () => await fs.mkdir(resolvedPath));
    return db;
  } catch {
    throw new Error("Can not create directory");
  }
}
