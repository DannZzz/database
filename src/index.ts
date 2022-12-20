import { Database } from "./db/Database";
import * as path from "path";

export { Schema, Value } from "./db/Schema";

export async function createDatabase(dirPath: string): Promise<Database> {
  const resolvedPath = path.resolve(dirPath);
  const db = new Database(resolvedPath);

  try {
    await db._create();
    return db;
  } catch {
    return null;
  }
}
