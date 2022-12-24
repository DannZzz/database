import { Database, DatabaseOptions } from "./db/Database";
import * as path from "path";

export { Schema, Value } from "./db/Schema";
export type { Model } from "./db/Model";
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
    await db._create();
    return db;
  } catch {
    return null;
  }
}
