import path from "path";
import fs from "fs/promises";
import { Dann } from "./dannParser";

export async function readModel(dbPath: string, modelName: string) {
  try {
    const content = await fs.readFile(path.join(dbPath, modelName + ".dann"));
    return Dann.stringToArray(content.toString());
  } catch {
    throw new Error("Can not read model file: " + modelName);
  }
}

export async function writeModel(dbPath: string, modelName: string, data: any) {
  try {
    await fs.writeFile(
      path.join(dbPath, modelName + ".dann"),
      Dann.arrayToString(data)
    );
  } catch {
    throw new Error("Can not write model file: " + modelName);
  }
}
