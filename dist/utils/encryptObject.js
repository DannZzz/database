"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptObject = exports.encryptObject = void 0;
const encrypt_1 = require("./encrypt");
const encryptAny = (val, passphrase) => {
    if (Array.isArray(val)) {
        return val.map((anyVal) => encryptAny(anyVal, passphrase));
    }
    else if (val instanceof Object) {
        return (0, exports.encryptObject)(val, passphrase);
    }
    return (0, encrypt_1.encrypt)(val, passphrase);
};
const decryptAny = (val, passphrase) => {
    if (Array.isArray(val)) {
        return val.map((anyVal) => decryptAny(anyVal, passphrase));
    }
    else if (val instanceof Object) {
        return (0, exports.decryptObject)(val, passphrase);
    }
    return (0, encrypt_1.decrypt)(val, passphrase);
};
const encryptObject = (object, passphrase) => {
    let _ = {};
    if (typeof object === "object") {
        for (let key in object) {
            const val = object[key];
            const encedKey = (0, encrypt_1.encrypt)(key, passphrase);
            let encedVal;
            if (typeof val === "object") {
                if (Array.isArray(val)) {
                    encedVal = val.map((anyVal) => encryptAny(anyVal, passphrase));
                }
                else {
                    encedVal = (0, exports.encryptObject)(val, passphrase);
                }
            }
            else {
                encedVal = encryptAny(val, passphrase);
            }
            _[encedKey] = encedVal;
        }
    }
    return _;
};
exports.encryptObject = encryptObject;
const decryptObject = (object, passphrase) => {
    let _ = {};
    if (typeof object === "object") {
        for (let key in object) {
            const val = object[key];
            const encedKey = (0, encrypt_1.decrypt)(key, passphrase);
            let encedVal;
            if (typeof val === "object") {
                if (Array.isArray(val)) {
                    encedVal = val.map((anyVal) => decryptAny(anyVal, passphrase));
                }
                else {
                    encedVal = (0, exports.decryptObject)(val, passphrase);
                }
            }
            else {
                encedVal = decryptAny(val, passphrase);
            }
            _[encedKey] = encedVal;
        }
    }
    return _;
};
exports.decryptObject = decryptObject;
