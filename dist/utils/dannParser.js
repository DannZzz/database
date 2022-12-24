"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dann = void 0;
class Dann {
    static stringToArray(str) {
        return (typeof str === "string" ? str : "")
            .split(")")
            .join("")
            .split("(")
            .map((s) => s.trim())
            .filter((f) => !!f);
    }
    static arrayToString(arr) {
        if (!arr.length)
            return "";
        return (Array.isArray(arr) ? arr : []).map((str) => `(${str})`).join("\n");
    }
}
exports.Dann = Dann;
