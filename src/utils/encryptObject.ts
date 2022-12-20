import { AnyObject } from "../typing/types";
import { encrypt, decrypt } from "./encrypt";

const encryptAny = (
  val: AnyObject | any[] | string | number | boolean,
  passphrase?: string
) => {
  if (Array.isArray(val)) {
    return val.map((anyVal) => encryptAny(anyVal, passphrase));
  } else if (val instanceof Object) {
    return encryptObject(val, passphrase);
  }
  return encrypt(val, passphrase);
};

const decryptAny = (
  val: AnyObject | any[] | string | number | boolean,
  passphrase?: string
) => {
  if (Array.isArray(val)) {
    return val.map((anyVal) => decryptAny(anyVal, passphrase));
  } else if (val instanceof Object) {
    return decryptObject(val, passphrase);
  }
  return decrypt(val, passphrase);
};

export const encryptObject = (
  object: AnyObject,
  passphrase?: string
): AnyObject => {
  let _ = {};

  if (typeof object === "object") {
    for (let key in object) {
      const val = object[key];

      const encedKey = encrypt(key, passphrase);
      let encedVal: any;

      if (typeof val === "object") {
        if (Array.isArray(val)) {
          encedVal = val.map((anyVal) => encryptAny(anyVal, passphrase));
        } else {
          encedVal = encryptObject(val, passphrase);
        }
      } else {
        encedVal = encryptAny(val, passphrase);
      }
      _[encedKey] = encedVal;
    }
  }

  return _;
};

export const decryptObject = (
  object: AnyObject,
  passphrase?: string
): AnyObject => {
  let _ = {};

  if (typeof object === "object") {
    for (let key in object) {
      const val = object[key];

      const encedKey = decrypt(key, passphrase);
      let encedVal: any;

      if (typeof val === "object") {
        if (Array.isArray(val)) {
          encedVal = val.map((anyVal) => decryptAny(anyVal, passphrase));
        } else {
          encedVal = decryptObject(val, passphrase);
        }
      } else {
        encedVal = decryptAny(val, passphrase);
      }

      _[encedKey] = encedVal;
    }
  }

  return _;
};
