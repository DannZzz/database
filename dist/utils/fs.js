"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeModel = exports.readModel = void 0;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const dannParser_1 = require("./dannParser");
async function readModel(dbPath, modelName) {
    try {
        const content = await promises_1.default.readFile(path_1.default.join(dbPath, modelName + ".dann"));
        return dannParser_1.Dann.stringToArray(content.toString());
    }
    catch {
        throw new Error("Can not read model file: " + modelName);
    }
}
exports.readModel = readModel;
async function writeModel(dbPath, modelName, data) {
    try {
        await promises_1.default.writeFile(path_1.default.join(dbPath, modelName + ".dann"), dannParser_1.Dann.arrayToString(data));
    }
    catch {
        throw new Error("Can not write model file: " + modelName);
    }
}
exports.writeModel = writeModel;
