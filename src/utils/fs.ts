import path from "path";
import fs from "fs/promises";

export async function readModel(dbPath: string, modelName: string) {
  try {
    const content = await fs.readFile(path.join(dbPath, modelName + ".json"));

    return JSON.parse(content.toString());
  } catch {
    throw new Error("Can not read model file: " + modelName);
  }
}

export async function writeModel(dbPath: string, modelName: string, data: any) {
  try {
    await fs.writeFile(
      path.join(dbPath, modelName + ".json"),
      JSON.stringify(data)
    );
  } catch {
    throw new Error("Can not write model file: " + modelName);
  }
}
