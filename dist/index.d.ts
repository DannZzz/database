import { Database } from "./db/Database";
export { Schema, Value } from "./db/Schema";
export declare function createDatabase(dirPath: string): Promise<Database>;
