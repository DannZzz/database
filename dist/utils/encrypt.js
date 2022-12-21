"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const config_1 = require("../config");
const crypto_js_1 = require("crypto-js");
const encrypt = (str, passphrase) => {
    if (!str && str !== 0)
        return str;
    if (typeof str === "string")
        return crypto_js_1.AES.encrypt(`${str}`, passphrase || config_1.SECRET_PASS).toString();
    return str;
};
exports.encrypt = encrypt;
const decrypt = (str, passphrase) => {
    if (!str && str !== 0)
        return str;
    if (typeof str === "string")
        return crypto_js_1.AES.decrypt(`${str}`, passphrase || config_1.SECRET_PASS).toString(crypto_js_1.enc.Utf8);
    return str;
};
exports.decrypt = decrypt;
