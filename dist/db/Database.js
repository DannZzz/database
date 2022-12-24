"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const Model_1 = require("./Model");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class Database {
    path;
    _enc;
    _models = [];
    constructor(options) {
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
            await promises_1.default.readdir(this.path).catch(async () => await promises_1.default.mkdir(this.path));
        }
        catch {
            throw new Error("Can not create directory");
        }
    }
    async createModel(modelName, schema) {
        const model = new Model_1.Model({
            modelName,
            schema,
            dbPath: this.path,
            enc_pass: this._enc,
        });
        try {
            const p = path_1.default.join(this.path, modelName + ".dann");
            await promises_1.default.readFile(p).catch(() => {
                promises_1.default.writeFile(p, "");
            });
        }
        catch {
            throw new Error("Can't create model file, maybe parent folder doesn't exist");
        }
        this._models.push(model);
        return model;
    }
}
exports.Database = Database;
