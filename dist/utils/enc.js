"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBase = exports.toReadable = void 0;
const encrypt_1 = require("./encrypt");
const encryptObject_1 = require("./encryptObject");
const toReadable = (fromBase, passphrase) => {
    return (0, encryptObject_1.decryptObject)(JSON.parse((0, encrypt_1.decrypt)(fromBase, passphrase)), passphrase);
};
exports.toReadable = toReadable;
const toBase = (object, passphrase) => {
    return (0, encrypt_1.encrypt)(JSON.stringify((0, encryptObject_1.encryptObject)(object, passphrase)), passphrase);
};
exports.toBase = toBase;
