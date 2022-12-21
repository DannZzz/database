export class Dann {
  static stringToArray(str: string): string[] {
    return (typeof str === "string" ? str : "")
      .split(")")
      .join("")
      .split("(")
      .map((s) => s.trim())
      .filter((f) => !!f);
  }

  static arrayToString(arr: string[]): string {
    if (!arr.length) return "";
    return (Array.isArray(arr) ? arr : []).map((str) => `(${str})`).join("\n");
  }
}
